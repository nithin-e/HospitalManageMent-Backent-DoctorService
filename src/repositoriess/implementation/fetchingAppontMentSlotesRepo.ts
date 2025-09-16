import AppointmentSlot from "../../entities/storeAppointmentSlot_schema";
import AppointmentModel from "../../entities/AppointmentModel";
import { IAppointmentRepository } from "../interFace/fetchingAppontMentSlotesRepoInterFace";
import {
  AllAppointmentsResponse,
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  DateSlots,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  IAppointment,
  SlotInfo,
  updateData,
  UserAppointmentsResponse,
} from "../../doctorInterFace/IdoctorType";
import serviceModel, { IService } from "../../entities/serviceModel";
import { BaseRepository } from "./baseRepo";



export default class fetchingAppontMentSloteRepo
  extends BaseRepository<IService>
  implements IAppointmentRepository
{
  constructor() {
    super(serviceModel);
  }

  fetchAppointmentSlots = async (
    request: FetchAppointmentSlotsRequest
  ): Promise<FetchAppointmentSlotsResponse> => {
    try {
      

      const appointmentSlots = await AppointmentSlot.find({
        doctorEmail: request.email,
      });

      if (!appointmentSlots || appointmentSlots.length === 0) {
        console.log("No appointment slots found for this doctor");
        return {
          success: false,
          slots_created: 0,
          dates: [],
          time_slots: [],
        };
      }

      // Type for grouped slots
      interface SlotsByDateType {
        [date: string]: SlotInfo[];
      }

      const slotsByDate: SlotsByDateType = {};

      appointmentSlots.forEach((slot) => {
        if (!slotsByDate[slot.date]) {
          slotsByDate[slot.date] = [];
        }

        slotsByDate[slot.date].push({
          id: slot._id.toString(),
          time: slot.time,
          is_booked: slot.isBooked,
        });
      });

      const uniqueDates = Object.keys(slotsByDate);
      const timeSlots: DateSlots[] = uniqueDates.map((date) => ({
        date: date,
        slots: slotsByDate[date].map((slot) => ({
          id: slot.id,
          time: slot.time,
          is_booked: slot.is_booked,
        })),
      }));

      console.log(
        `In the repositories: Found ${appointmentSlots.length} slots across ${uniqueDates.length} dates`
      );

      return {
        success: true,
        slots_created: appointmentSlots.length,
        dates: uniqueDates,
        time_slots: timeSlots,
      };
    } catch (error) {
      console.error("Error fetching doctor slots:", error);
      throw error;
    }
  };

  createAppointment = async (
    appointmentData: AppointmentRequest
  ): Promise<AppointmentResponse> => {
    try {
      console.log("Appointment data in repository:", appointmentData);

      // Find the specific appointment slot
      const appointmentSlot = await AppointmentSlot.findOne({
        doctorEmail: appointmentData.patientEmail,
        date: appointmentData.appointmentDate,
        time: appointmentData.appointmentTime,
      });

      if (!appointmentSlot) {
        throw new Error("Appointment slot not found");
      }

      if (appointmentSlot.isBooked) {
        throw new Error("This appointment slot is already booked");
      }

      // Update the slot status
      appointmentSlot.isBooked = true;
      appointmentSlot.patientEmail = appointmentData.userEmail;
      appointmentSlot.updatedAt = new Date();
      await appointmentSlot.save();

      //  const appointmentLimit= await AppointmentModel.find{()}

      // Create new appointment record
      const newAppointment = new AppointmentModel({
        patientName: appointmentData.patientName,
        doctorEmail: appointmentData.patientEmail,
        patientPhone: appointmentData.patientPhone,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        notes: appointmentData.notes,
        doctorName: appointmentData.doctorName,
        specialty: appointmentData.specialty,
        patientEmail: appointmentData.userEmail,
        doctorId: appointmentData.doctorId,
        userId: appointmentData.userId,
        status: "scheduled",
        created_at: new Date(),
        amount: "500",
        adminAmount: "150",
        doctorAmount: "350",
        paymentStatus: "success",
        payment_method: "online",
        payment_status: "pending",
      });

      const savedAppointment = await newAppointment.save();

      return {
        id: savedAppointment._id.toString(),
        message: "Appointment booked successfully",
      };
    } catch (error) {
      console.error("Error storing appointment:", error);
      throw new Error(
        `Failed to store appointment: ${(error as Error).message}`
      );
    }
  };

  fetchUserAppointments = async (
    email: string,
    page: number = 1,
    limit: number = 3
  ): Promise<UserAppointmentsResponse> => {
    try {
      console.log("Fetching appointments with email in repo:", email);
      console.log("Pagination params - Page:", page, "Limit:", limit);

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      const query = {
        $or: [
          { patientEmail: email },
          {
            doctorEmail: email,
            doctorAmount: {
              $exists: true,
              $nin: [null, "", 0, undefined],
            },
          },
        ],
      };

      console.log("Query filter:", query);

      const totalAppointments = await AppointmentModel.countDocuments(query);

      const totalPages = Math.ceil(totalAppointments / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

     


        // Remove the type assertion
const appointments = await AppointmentModel.find(query)
  .sort({ appointmentDate: -1, appointmentTime: -1 })
  .skip(skip)
  .limit(limit);



      if (!appointments || appointments.length === 0) {
        return {
          appointments: [],
          success: true,
          message:
            totalAppointments === 0
              ? "No appointments found for this email"
              : `No appointments found for page ${page}`,
          currentPage: page,
          totalPages: totalPages,
          totalAppointments: totalAppointments,
          limit: limit,
          hasNextPage: false,
          hasPrevPage: hasPrevPage,
        };
      }

      // Format appointments
      const formattedAppointments: Appointment[] = appointments.map(
        (appointment) => {
          const baseAppointment: Appointment = {
            id: appointment._id?.toString() || appointment.id || "",
            patientName: appointment.patientName || "Unknown",
            doctorEmail: appointment.doctorEmail || "",
            patientPhone: appointment.patientPhone || "",
            appointmentDate: appointment.appointmentDate || "",
            appointmentTime: appointment.appointmentTime || "",
            notes: appointment.notes || "",
            doctorName: appointment.doctorName || "",
            specialty: appointment.specialty || "",
            patientEmail: appointment.patientEmail || "",
            status: appointment.status || "unknown",
            doctorId: appointment.doctorId || "",
            userId: appointment.userId || "",
            userRefoundAmount: appointment.userRefoundAmount,
            doctorAmount: appointment.doctorAmount || "",
          };

          // Add optional fields if they exist
          if (appointment.message)
            baseAppointment.message = appointment.message;
          if (appointment.Prescription)
            baseAppointment.Prescription = appointment.Prescription;

          return baseAppointment;
        }
      );

      console.log(`Formatted appointments for page ${page}:`, totalPages);

      return {
        appointments: formattedAppointments,
        success: true,
        message: "Appointments fetched successfully",
        currentPage: page,
        totalPages: totalPages,
        totalAppointments: totalAppointments,
        limit: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
      };
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw new Error(
        `Failed to fetch appointments: ${(error as Error).message}`
      );
    }
  };

  fetchAllUserAppointments = async (
    page: number,
    limit: number
  ): Promise<AllAppointmentsResponse> => {
    try {
      const skip = (page - 1) * limit;

      const [appointments, totalAppointments] = await Promise.all([
        AppointmentModel.find()
          .sort({ appointmentDate: 1, appointmentTime: 1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        AppointmentModel.countDocuments(),
      ]);

      const totalPages = Math.ceil(totalAppointments / limit);

      return {
        appointments: appointments.map((appointment) => ({
          id: appointment._id?.toString(),
          patientName: appointment.patientName,
          doctorEmail: appointment.doctorEmail,
          patientPhone: appointment.patientPhone,
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          notes: appointment.notes,
          doctorName: appointment.doctorName,
          specialty: appointment.specialty,
          patientEmail: appointment.patientEmail,
          status: appointment.status,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          message: appointment.message,
          amount: appointment.amount,
          adminAmount: appointment.adminAmount,
          doctorAmount: appointment.doctorAmount,
          userRefoundAmount: appointment.userRefoundAmount,
          paymentStatus: appointment.paymentStatus,
          payment_method: appointment.payment_method,
          payment_status: appointment.payment_status,
          doctorId: appointment.doctorId,
          userId: appointment.userId,
          Prescription: appointment.Prescription,
        })) as IAppointment[],
        success: true,
        message: "Appointments fetched successfully",
        currentPage: page,
        totalPages,
        totalAppointments,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      throw new Error(
        `Failed to fetch appointments: ${(error as Error).message}`
      );
    }
  };

  cancelUserAppointment = async (
    appointmentId: CancelAppointmentRequest["appointmentId"]
  ): Promise<CancelAppointmentResponse> => {
    try {
      console.log("Received appointment id for cancellation:", appointmentId);

      const result = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { status: "cancelled" },
        { new: true }
      );

      if (!result) {
        return {
          success: false,
          message: "Appointment not found",
        };
      }

      return {
        success: true,
        message: "Appointment cancelled successfully",
      };
    } catch (error) {
      console.error("Error while cancelling appointment:", error);
      throw new Error(
        `Failed to cancel appointment: ${(error as Error).message}`
      );
    }
  };

  createService = async (
    name: string,
    description: string
  ): Promise<boolean> => {
    try {
      const newService: IService = new serviceModel({ name, description });
      await newService.save();
      return true;
    } catch (error) {
      console.error("Error creating service in repository:", error);
      return false;
    }
  };

  fetchService = async (): Promise<IService[]> => {
    try {
      return await this.find({});
    } catch (error) {
      console.error("Error fetching services from repository:", error);
      throw error; // Re-throw the error so calling code can handle it
    }
  };

  deleteService = async (serviceId: string): Promise<boolean> => {
    try {
      console.log("Deleting service with Id:", serviceId);

      // Use repository method to delete
      const deletedService = await this.deleteById(serviceId);

      if (!deletedService) {
        console.warn("Service not found:", serviceId);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting service in repository:", error);
      return false;
    }
  };


editService = async (serviceId: string, name?: string, description?: string): Promise<boolean> => {
  try {
    console.log("While editing service:", serviceId, name, description);

  
    const existingService = await serviceModel.findById(serviceId);
    
    console.log('Existing service found:', existingService);
    
  
    if (!existingService) {
      console.error("Service not found with ID:", serviceId);
      return false;
    }


    const updateData: updateData = {};
   

  
    const updatedService = await serviceModel.findByIdAndUpdate(
      serviceId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedService) {
      console.error("Failed to update service");
      return false;
    }

    console.log("Service updated successfully:", updatedService);
    return true;

  } catch (error) {
    console.error("Error editing service in repository:", error);
    return false;
  }
}


}
