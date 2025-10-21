import {
  AllAppointmentsResponse,
  AppointmentRequest,
  AppointmentResponse,
  AppointmentUpdateResponse,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  FilteringResponse,
  SearchParam,
  UserAppointmentsResponse,
} from "../../types/Doctor.interface";
import { IService } from "../../entities/serviceModel";
import { IAppointmentSlotsRepository } from "./IStore-appointmentslots.repository";

export interface IAppointmentRepository extends IAppointmentSlotsRepository {

  createAppointment(
    appointmentData: AppointmentRequest
  ): Promise<AppointmentResponse>;
  fetchUserAppointments(
    email: string,
    page: number,
    limit: number
  ): Promise<UserAppointmentsResponse>;
  fetchAllUserAppointments(
    email:string,
    page: number,
    limit: number
  ): Promise<AllAppointmentsResponse>;
  cancelUserAppointment(
    appointmentId: CancelAppointmentRequest["appointmentId"]
  ): Promise<CancelAppointmentResponse>;

    filteringDoctorAppoinments(params: SearchParam): Promise<FilteringResponse>;

      updateAppointmentAfterConsultation(
        appointmentId: string,
        endedBy: string
      ): Promise<AppointmentUpdateResponse>;
  
}
