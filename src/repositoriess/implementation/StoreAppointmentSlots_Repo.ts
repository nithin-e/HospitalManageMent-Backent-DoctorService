import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import AppointmentModel from "../../entities/AppointmentModel";
import { IAppointmentSlotsRepository } from "../interFace/StoreAppointmentSlots_RepoInterFace";
import Prescription from "../../entities/PrescriptionModel";
import {
  AppointmentSlotDocument,
  AppointmentSlotsData,
  Cancelres,
  DbResponse,
  FetchDoctorSlotsResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
  Slot,
} from "../../doctorInterFace/IdoctorType";
import { generateRecurringDates } from "../../utility/generateRecurringDates";
import { replicateTimeSlotsForDates } from "../../utility/replicateTimeSlotsForDates";
import mongoose from "mongoose";
import { appointmentaData } from "../../controllerr/implementation/StoreAppointmentSlots_Controller";

const convertTo12HourFormat = (time24: any): string => {
  try {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const minute = minutes || "00";

    if (hour === 0) {
      return `12:${minute} AM`;
    } else if (hour < 12) {
      return `${hour}:${minute} AM`;
    } else if (hour === 12) {
      return `12:${minute} PM`;
    } else {
      return `${hour - 12}:${minute} PM`;
    }
  } catch (error) {
    console.error("Error converting time format:", error);
    return time24; // Return original if conversion fails
  }
};

function convertToDbDateFormat(dateString: string): string {
  try {
    // Convert "June 15, 2025" to "2025-06-15"
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Date conversion error:", error);
    return dateString; // Return original if conversion fails
  }
}

export interface CancelData {
  time: string;
  date: string;
  email: string;
}

export interface CancelResponse {
  success: boolean;
  message: string;
  error?: string;
}

export interface PrescriptionData {
  doctorId: string;
  patientId: string;
  appointmentId: string;
  prescriptionDetails: string;
  date: string;
  time: string;
}

export interface PrescriptionResponse {
  success: boolean;
}

export interface FetchPrescriptionRequest {
  doctorId: string;
  userIdd: string;
  appointmentId: string;
  date: string;
  time: string;
}

export interface FetchPrescriptionResponse {
  prescriptionDetails: string;
  date: string;
  time: string;
  patientEmail: string | null;
  doctorEmail: string | null;
}

export default class FetchNotificationRepo
  implements IAppointmentSlotsRepository
{
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

      console.log(
        "plz check the appoinment data inside the repository layer;",
        appointmentData
      );

      let allTimeSlots = [...time_slots];
      let allSelectedDates = [...selected_dates];

      console.log("check this allTimeSlots", allTimeSlots);
      console.log("check this allSelectedDates", allSelectedDates);

      if (date_range === "oneWeek") {
        console.log(
          `🔄 Creating recurring slots for the next ${recurring_months} months`
        );

        const recurringDates = generateRecurringDates(
          selected_dates,
          recurring_months
        );
        console.log(`📅 Generated ${recurringDates.length} recurring dates`);

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

      console.log(
        `💾 Attempting to insert ${appointmentSlots.length} appointment slots`
      );

      let insertedCount = 0;

      try {
        const result = await AppointmentSlot.insertMany(appointmentSlots, {
          ordered: false,
        });
        insertedCount = result.length;
        console.log(
          "✅ Successfully inserted appointment slots:",
          insertedCount
        );
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

  updateAppointmentSlots = async (appointmentData: any) => {
    try {
      const { doctor_email, removed_slot_ids, new_time_slots } =
        appointmentData;

      console.log("Updating appointment slots for doctor:", doctor_email);

      let removedCount = 0;
      let updatedCount = 0;
      let datesAffected = new Set<string>();

      // Remove slots that are marked for deletion
      if (removed_slot_ids && removed_slot_ids.length > 0) {
        console.log("Removing slot IDs:", removed_slot_ids);

        // Only remove slots that are not booked and belong to the doctor
        const deleteResult = await AppointmentSlot.deleteMany({
          _id: { $in: removed_slot_ids },
          doctorEmail: doctor_email,
          isBooked: false, // Safety: Only delete unbooked slots
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

        // Prepare new slot documents

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

      // Get all unique dates for the doctor after the update
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
        dates: allSlots.sort(), // Return sorted dates
      };
    } catch (error) {
      console.error("Error in updateAppointmentSlots:", error);
      throw error;
    }
  };

  async fetchDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse> {
    try {
      const doctorSlots: AppointmentSlotDocument[] = await AppointmentSlot.find(
        {
          doctorEmail: email,
        }
      );

      if (!doctorSlots || doctorSlots.length === 0) {
        console.log("Zero slots found for doctor:", email);
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

      console.log("the doctoe have something plz check");

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

  // Repository layer: Processing reschedule data
  rescheduleAppointment = async (
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse> => {
    try {
      console.log("Processing reschedule data:", rescheduleData);

      // Extract data
      const { patientEmail, doctorEmail, originalSlot, newSlot, action } =
        rescheduleData;

      console.log("Step 1: Deleting original slot...");
      const deleteSlotResult = await AppointmentSlot.findByIdAndDelete(
        originalSlot.id
      );

      if (!deleteSlotResult) {
        throw new Error("Original slot not found or could not be deleted");
      }
      console.log("Original slot deleted successfully:", deleteSlotResult);

      console.log("Step 2: Finding user appointment...");
      const userAppointment = await AppointmentModel.findOne({
        patientEmail: patientEmail,
        appointmentTime: originalSlot.time,
        appointmentDate: originalSlot.date,
      });

      if (!userAppointment) {
        throw new Error("User appointment not found");
      }
      console.log("User appointment found:", userAppointment);

      // Step 3: Update the appointment with new slot time and add reschedule message
      console.log("Step 3: Updating appointment...");
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

      console.log("Appointment updated successfully:", updateResult);

      // Step 4: Create/update the new slot
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

      console.log("New slot processed successfully:", newSlotResult);

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
          patientEmail: "", // Clear patient email
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

  cancelAppointmentByDoctor = async (
    appointmentData: appointmentaData
  ): Promise<Cancelres> => {
    try {
      console.log(
        "check this data inside the reposotory layr",
        appointmentData
      );
      // implement the logic here
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
