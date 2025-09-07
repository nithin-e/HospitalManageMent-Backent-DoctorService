import { IFetchAppointmentSlotsService } from "../interFace/fetchAppontMentSlotesInterFace";
import {
  AllAppointmentsResponse,
  AppointmentRequest,
  AppointmentResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  IAppointment,
  UserAppointmentsResponse,
} from "../../doctorInterFace/IdoctorType";
import { IAppointmentRepository } from "../../repositoriess/interFace/fetchingAppontMentSlotesRepoInterFace";
import { IService } from "../../entities/serviceModel";
import { response } from "express";

export default class fetchingAppontMentSlotesService
  implements IFetchAppointmentSlotsService
{
  private _fetchingAppointmentSlotsRepository: IAppointmentRepository;

  constructor(fetchingAppointmentSlotsRepo: IAppointmentRepository) {
    this._fetchingAppointmentSlotsRepository = fetchingAppointmentSlotsRepo;
  }

  fetchAppointmentSlots = async (
    request: FetchAppointmentSlotsRequest
  ): Promise<FetchAppointmentSlotsResponse> => {
    try {
      const response =
        await this._fetchingAppointmentSlotsRepository.fetchAppointmentSlots(
          request
        );
      return response;
    } catch (error) {
      console.error("Error in service layer:", error);
      throw error;
    }
  };

  makeAppointment = async (
    request: AppointmentRequest
  ): Promise<AppointmentResponse> => {
    try {
      // Map and validate data
      const appointmentData: AppointmentRequest = {
        patientName: request.patientName,
        patientEmail: request.patientEmail,
        patientPhone: request.patientPhone,
        appointmentDate: request.appointmentDate,
        appointmentTime: request.appointmentTime,
        doctorName: request.doctorName,
        specialty: request.specialty,
        userEmail: request.userEmail,
        notes: request.notes || "",
        userId: request.userId,
        doctorId: request.doctorId,
      };

      console.log("Validated appointment data:", appointmentData);

      // Pass to repository
      return await this._fetchingAppointmentSlotsRepository.createAppointment(
        appointmentData
      );
    } catch (error) {
      console.error("Error in service layer:", error);
      throw error;
    }
  };

fetchUserAppointments = async (
  email: string,
  page: number = 1,
  limit: number = 3
): Promise<UserAppointmentsResponse> => {
  try {
    return await this._fetchingAppointmentSlotsRepository.fetchUserAppointments(
      email,
      page,
      limit
    );
  } catch (error) {
    console.error("Error in fetching single user use case:", error);
    throw error;
  }
};


fetchAllUserAppointments = async (
  page: number,
  limit: number
): Promise<AllAppointmentsResponse> => {
  try {
    const response = await this._fetchingAppointmentSlotsRepository.fetchAllUserAppointments(page, limit);
    return response;
  } catch (error) {
    console.error("Error in fetching all user appointments service:", error);
    throw error;
  }
};

  cancelUserAppointment = async (
    appointmentId: CancelAppointmentRequest["appointmentId"]
  ): Promise<CancelAppointmentResponse> => {
    try {
      if (!appointmentId) {
        throw new Error("Appointment ID is required");
      }

      const response =
        await this._fetchingAppointmentSlotsRepository.cancelUserAppointment(
          appointmentId
        );

      return response;
    } catch (error) {
      console.error("Error in cancelling appointment service:", error);
      throw error;
    }
  };

  createService = async (
    name: string,
    description: string
  ): Promise<boolean> => {
    try {
      console.log("Service created:", name, description);
      const response =
        await this._fetchingAppointmentSlotsRepository.createService(
          name,
          description
        );

      return response; // ✅ success
    } catch (error) {
      console.error("Error creating service:", error);
      return false; // ✅ failure
    }
  };

  fetchService = async (): Promise<IService[]> => {
    try {
      const response =
        await this._fetchingAppointmentSlotsRepository.fetchService();
      return response;
    } catch (error) {
      console.error("Error fetching service:", error);
      throw error; // Re-throw to let controller handle it
    }
  };

  deleteService = async (serviceId: string): Promise<boolean> => {
    try {
      const response =
        await this._fetchingAppointmentSlotsRepository.deleteService(serviceId);

      return response; // ✅ success
    } catch (error) {
      console.error("Error creating service:", error);
      return false; // ✅ failure
    }
  };

  editService = async (serviceId: string,name?:string,description?:string): Promise<boolean> => {
    try {
      const response =
        await this._fetchingAppointmentSlotsRepository.editService(serviceId,name,description);

      return response; 
    } catch (error) {
      console.error("Error creating service:", error);
      return false; 
    }
  };
}
