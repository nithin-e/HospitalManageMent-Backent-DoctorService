import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import AppointmentModel from "../../entities/AppointmentModel";
import { IAppointmentSlotsRepository } from "../interFace/IStoreAppointmentSlotsRepository";
import Prescription from "../../entities/PrescriptionModel";
import {
  appointmentaData,
  AppointmentSlotDocument,
  AppointmentSlotsData,
  CancelData,
  Cancelres,
  CancelResponse,
  DbResponse,
  FetchDoctorSlotsResponse,
  FetchPrescriptionRequest,
  FetchPrescriptionResponse,
  PrescriptionData,
  PrescriptionResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
  Slot,
} from "../../interfaces/Doctor.interface";
import { generateRecurringDates } from "../../utility/generateRecurringDates";
import { replicateTimeSlotsForDates } from "../../utility/replicateTimeSlotsForDates";
import mongoose from "mongoose";
import {
  convertTo12HourFormat,
  convertToDbDateFormat,
} from "../../utility/timeFormatter";

/**
 * Repository layer for managing appointment slots, cancellations,
 * rescheduling, and prescriptions.
 *
 * Handles all database interactions with Mongoose models.
 */

export default class FetchNotificationRepo
  implements IAppointmentSlotsRepository
{
  /**
   * Store appointment slots (create or update depending on action).
   */

  storeAppointmentSlots = async (
    appointmentData: AppointmentSlotsData
  ): Promise<DbResponse> => {
    try {
      console.log(
        "Repository layer processing appointment data:",
        appointmentData
      );

      const { action } = appointmentData;

      if (action === "update") {
        return await this.updateAppointmentSlots(appointmentData);
      } else {
        return await this.createAppointmentSlots(appointmentData);
      }
    } catch (error) {
      console.error("Error in appointment slots repository:", error);
      throw error;
    }
  };

  /**
   * Creates new appointment slots for a doctor.
   */
  createAppointmentSlots = async (appointmentData: AppointmentSlotsData) => {
    try {
      const {
        doctor_email,
        date_range,
        selected_dates,
        time_slots,
        create_recurring = false,
        recurring_months = 6,
      } = appointmentData;

      let allTimeSlots = [...time_slots];
      let allSelectedDates = [...selected_dates];

      if (date_range === "oneWeek") {
        const recurringDates = generateRecurringDates(
          selected_dates,
          recurring_months
        );

        const recurringTimeSlots = replicateTimeSlotsForDates(
          time_slots,
          recurringDates
        );

        allTimeSlots = [...time_slots, ...recurringTimeSlots];
        allSelectedDates = [...selected_dates, ...recurringDates];
      }

      const appointmentSlots = [];

      for (const timeSlot of allTimeSlots) {
        const { date, slots } = timeSlot;

        for (const time of slots) {
          const convertedTime = convertTo12HourFormat(time);

          appointmentSlots.push({
            doctorEmail: doctor_email,
            date: date,
            time: convertedTime,
            originalTime: time,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date(),

            isRecurring: create_recurring && !selected_dates.includes(date),
          });
        }
      }

      let insertedCount = 0;

      try {
        const result = await AppointmentSlot.insertMany(appointmentSlots, {
          ordered: false,
        });
        insertedCount = result.length;
      } catch (err) {
        console.error("Error inserting appointment slots:", err);
      }

      return {
        success: true,
        message: "Appointment slots created successfully",
        slots_created: insertedCount,
        dates: selected_dates,
        slots_removed: 0,
        slots_updated: 0,
      };
    } catch (error) {
      console.error("Error in createAppointmentSlots:", error);
      throw error;
    }
  };

  /**
   * Updates (removes or creates new) appointment slots for a doctor.
   */
  updateAppointmentSlots = async (appointmentData: any) => {
    try {
      const { doctor_email, removed_slot_ids, new_time_slots } =
        appointmentData;

      console.log("Updating appointment slots for doctor:", doctor_email);

      let removedCount = 0;
      let updatedCount = 0;
      let datesAffected = new Set<string>();

      if (removed_slot_ids && removed_slot_ids.length > 0) {
        console.log("Removing slot IDs:", removed_slot_ids);

        const deleteResult = await AppointmentSlot.deleteMany({
          _id: { $in: removed_slot_ids },
          doctorEmail: doctor_email,
          isBooked: false,
        });

        removedCount = deleteResult.deletedCount || 0;
        console.log(`Removed ${removedCount} appointment slots`);

        if (removedCount < removed_slot_ids.length) {
          console.warn(
            `Only ${removedCount} out of ${removed_slot_ids.length} slots were removed (some may be booked or not found)`
          );
        }
      }

      if (new_time_slots && new_time_slots.length > 0) {
        console.log("Creating new slots:", new_time_slots.length);

        const newSlots = new_time_slots.map((slot: any) => ({
          doctorEmail: doctor_email,
          date: slot.date,
          time: slot.time,
          isBooked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        try {
          // Insert multiple documents at once
          const insertResult = await AppointmentSlot.insertMany(newSlots, {
            ordered: false,
          });

          updatedCount += insertResult.length;

          // Track affected dates
          for (const slot of newSlots) {
            datesAffected.add(slot.date);
          }

          console.log(`Created ${insertResult.length} new appointment slots`);
        } catch (error) {
          console.error("Error creating appointment slots:", error);
          throw error;
        }
      }

      const allSlots = await AppointmentSlot.find(
        { doctorEmail: doctor_email },
        { date: 1, _id: 0 }
      ).distinct("date");

      return {
        success: true,
        message: `Appointment slots updated successfully. Removed: ${removedCount}, Updated: ${updatedCount}`,
        slots_created: 0,
        slots_removed: removedCount,
        slots_updated: updatedCount,
        dates: allSlots.sort(),
      };
    } catch (error) {
      console.error("Error in updateAppointmentSlots:", error);
      throw error;
    }
  };

  /**
   * Fetches all slots for a doctor.
   */
  async fetchDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse> {
    try {
      const doctorSlots: AppointmentSlotDocument[] = await AppointmentSlot.find(
        {
          doctorEmail: email,
        }
      );

      if (!doctorSlots || doctorSlots.length === 0) {
        return {
          success: false,
          message: "No appointment slots found for this doctor",
          slots_created: 0,
          dates: [],
          slots: [],
        };
      }

      const uniqueDates = [...new Set(doctorSlots.map((slot) => slot.date))];

      const formattedSlots: Slot[] = doctorSlots.map((slot) => ({
        id: slot._id.toString(),
        date: slot.date,
        time: slot.time,
        is_booked: slot.isBooked,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt,
        ...(slot.patientEmail && { patientEmail: slot.patientEmail }),
      }));

      return {
        success: true,
        message: "Doctor appointment slots retrieved successfully",
        slots_created: doctorSlots.length,
        dates: uniqueDates,
        slots: formattedSlots,
      };
    } catch (error) {
      console.error("Error fetching doctor slots:", error);
      throw error;
    }
  }

  /**
   * Reschedules an appointment for a user.
   */
  rescheduleAppointment = async (
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse> => {
    try {
      const { patientEmail, doctorEmail, originalSlot, newSlot, action } =
        rescheduleData;

      const deleteSlotResult = await AppointmentSlot.findByIdAndDelete(
        originalSlot.id
      );

      if (!deleteSlotResult) {
        throw new Error("Original slot not found or could not be deleted");
      }

      const userAppointment = await AppointmentModel.findOne({
        patientEmail: patientEmail,
        appointmentTime: originalSlot.time,
        appointmentDate: originalSlot.date,
      });

      if (!userAppointment) {
        throw new Error("User appointment not found");
      }

      const updateResult = await AppointmentModel.findByIdAndUpdate(
        userAppointment._id,
        {
          $set: {
            appointmentTime: newSlot.time24,
            message: `Your appointment has been rescheduled from ${originalSlot.time} to ${newSlot.time12}`,
            updated_at: new Date(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updateResult) {
        throw new Error("Failed to update user appointment");
      }

      let newSlotResult;
      const existingSlot = await AppointmentSlot.findOne({
        doctorEmail: doctorEmail,
        date: originalSlot.date,
        time: newSlot.time24,
      });

      if (existingSlot) {
        newSlotResult = await AppointmentSlot.findByIdAndUpdate(
          existingSlot._id,
          {
            $set: {
              isBooked: true,
              patientEmail: patientEmail,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
      } else {
        newSlotResult = await AppointmentSlot.create({
          doctorEmail: doctorEmail,
          date: originalSlot.date,
          time: newSlot.time24,
          isBooked: true,
          patientEmail: patientEmail,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return {
        success: true,
        message: "Appointment rescheduled successfully",
        data: {
          updatedAppointment: updateResult as mongoose.Document,
          originalSlotDeleted: deleteSlotResult as mongoose.Document,
          newSlot: newSlotResult as mongoose.Document,
          newSlotTime: newSlot.time12,
        },
      };
    } catch (error) {
      console.error("Error in handleAppointmentReschedule:", error);
      return {
        success: false,
        message: "Failed to reschedule appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  /**
   * Cancels an appointment from user side.
   */
  cancelAppointmentByUser = async (
    cancelData: CancelData
  ): Promise<CancelResponse> => {
    try {
      const { time, date, email } = cancelData;

      if (!time || !date || !email) {
        return {
          success: false,
          message: "Missing required fields: time, date, or email",
        };
      }

      const formattedDate = convertToDbDateFormat(date);

      console.log("Formatted date for query:", formattedDate);

      const appointment = await AppointmentModel.findOne({
        doctorEmail: email,
        appointmentDate: formattedDate,
        appointmentTime: time,
        status: "scheduled",
      });

      if (!appointment) {
        console.log("Appointment not found with query parameters");

        const debugAppointments = await AppointmentModel.find({
          doctorName: email,
        });
        console.log("All appointments for this doctor:", debugAppointments);

        return {
          success: false,
          message: "Appointment not found or already cancelled",
        };
      }

      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        appointment._id,
        {
          status: "cancelled",
          updated_at: new Date(),
          adminAmount: "100",
          userRefoundAmount: "150",
          doctorAmount: "250",
        },
        { new: true }
      );

      const slotUpdate = await AppointmentSlot.findOneAndUpdate(
        {
          doctorEmail: appointment.doctorEmail,
          date: formattedDate,
          time: time,
          isBooked: true,
        },
        {
          isBooked: false,
          patientEmail: "",
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!slotUpdate) {
        console.warn(
          `Appointment slot not found for doctor: ${appointment.doctorEmail}, date: ${formattedDate}, time: ${time}`
        );

        return {
          success: true,
          message:
            "Appointment cancelled successfully, but slot availability could not be updated",
        };
      }

      return {
        success: true,
        message: "Appointment cancelled successfully and slot is now available",
      };
    } catch (error) {
      console.error("Error in Canceling_AppointMent__UserSide:", error);
      return {
        success: false,
        message: "Failed to cancel appointment",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  /**
   * Creates a prescription for an appointment.
   */
  createPrescription = async (
    prescriptionData: PrescriptionData
  ): Promise<PrescriptionResponse> => {
    try {
      console.log(
        "This is repository layer so check the Prescription data",
        prescriptionData
      );

      const newPrescription = new Prescription({
        doctorId: prescriptionData.doctorId,
        patientId: prescriptionData.patientId,
        appointmentId: prescriptionData.appointmentId,
        prescriptionDetails: prescriptionData.prescriptionDetails,
        time: prescriptionData.time,
        date: prescriptionData.date || new Date(),
      });

      await newPrescription.save();

      await AppointmentModel.findByIdAndUpdate(
        prescriptionData.appointmentId,
        { Prescription: "done" },
        { new: true }
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error saving prescription:", error);
      throw error;
    }
  };

  /**
   * Fetches a prescription by appointmentId.
   */

  fetchPrescription = async (
    prescriptionData: FetchPrescriptionRequest
  ): Promise<FetchPrescriptionResponse> => {
    try {
      console.log("check da kuttaa it is getting", prescriptionData);

      const prescription = await Prescription.findOne({
        appointmentId: prescriptionData.appointmentId,
      });

      if (!prescription) {
        throw new Error("Prescription not found");
      }

      const appointment = await AppointmentModel.findById(
        prescriptionData.appointmentId
      );

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      const response: FetchPrescriptionResponse = {
        prescriptionDetails: prescription.prescriptionDetails,
        date: prescription.date.toISOString(),
        time: prescription.time,
        patientEmail: appointment.patientEmail ?? null,
        doctorEmail: appointment.doctorEmail ?? null,
      };

      console.log("Fetched prescription response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching prescription:", error);
      throw error;
    }
  };

  /**
   * Cancels an appointment from doctor side.
   */
  cancelAppointmentByDoctor = async (
    appointmentData: appointmentaData
  ): Promise<Cancelres> => {
    try {
      console.log(
        "check this data inside the reposotory layr",
        appointmentData
      );

      const appointment = await AppointmentModel.findOne({
        patientEmail: appointmentData.patientEmail,
        doctorId: appointmentData.doctor_id,
        appointmentDate: appointmentData.date,
        appointmentTime: appointmentData.time,
        status: "scheduled",
      });

      console.log("check this also aftet the updation", appointment);

      if (!appointment) {
        return {
          success: false,
        };
      }

      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        appointment._id,
        {
          status: "cancelled",
          updated_at: new Date(),
          adminAmount: "",
          userRefoundAmount: "500",
          doctorAmount: "",
        },
        { new: true }
      );

      const slotUpdate = await AppointmentSlot.findOneAndUpdate(
        {
          doctorEmail: appointment.doctorEmail,
          date: appointmentData.date,
          time: appointmentData.time,
          isBooked: true,
        },
        {
          isBooked: false,
          patientEmail: "",
          updatedAt: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  };
}
