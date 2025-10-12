import {
  appointmentaData,
  AppointmentSlotsData,
  CancelData,
  Cancelres,
  CancelResponse,
  DbResponse,
  FetchDoctorSlotsResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../types/Doctor.interface";

export interface IAppointmentSlotsRepository {

  rescheduleAppointment(
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse>;
  cancelAppointmentByUser(cancelData: CancelData): Promise<CancelResponse>;

  cancelAppointmentByDoctor(
    appointmentData: appointmentaData
  ): Promise<Cancelres>;
}
