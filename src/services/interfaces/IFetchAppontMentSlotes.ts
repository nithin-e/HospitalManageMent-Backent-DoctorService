import {
  AllAppointmentsResponse,
  AppointmentRequest,
  AppointmentResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  
  FilteringResponse,
  
  UserAppointmentsResponse,
} from "../../types/Doctor.interface";
import { IService } from "../../entities/serviceModel";
import { IStoreAppointmentSlotsService } from "./IStoreAppointmentSlots";

export interface IFetchAppointmentSlotService extends IStoreAppointmentSlotsService {

  makeAppointment(request: AppointmentRequest): Promise<AppointmentResponse>;
  fetchUserAppointments(
    email: string,
    page: number,
    limit: number
  ): Promise<UserAppointmentsResponse>;
  fetchAllUserAppointments(
    page: number,
    limit: number
  ): Promise<AllAppointmentsResponse>;
  cancelUserAppointment(
    appointmentId: CancelAppointmentRequest["appointmentId"]
  ): Promise<CancelAppointmentResponse>;


   filteringDoctorAppoinments(params: {
      searchQuery?: string;
      sortBy?: string;
      sortDirection?: "asc" | "desc";
      page?: number;
      limit?: number;
      role?: string;
    }): Promise<FilteringResponse>;
}
