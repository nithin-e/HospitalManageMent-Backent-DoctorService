import {
  AllAppointmentsResponse,
  AppointmentRequest,
  AppointmentResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  
  UserAppointmentsResponse,
} from "../../interfaces/Doctor.interface";
import { IService } from "../../entities/serviceModel";

export interface IFetchAppointmentSlotsService {
  fetchAppointmentSlots(
    request: FetchAppointmentSlotsRequest
  ): Promise<FetchAppointmentSlotsResponse>;
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
  createService(name: string, description: string): Promise<boolean>;
  fetchService(): Promise<IService[]>;
  deleteService(serviceId: string): Promise<boolean>;
  editService(
    serviceId: string,
    name?: string,
    description?: string
  ): Promise<boolean>;
}
