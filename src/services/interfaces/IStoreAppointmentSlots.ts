import {
  appointmentaData,
  CancelData,
  Cancelres,
  CancelResponse,
  FetchDoctorSlotsResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../types/Doctor.interface";

export interface IStoreAppointmentSlotsService {

  rescheduleAppointment(
    data: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse>;
  cancelAppointmentByUser(data: CancelData): Promise<CancelResponse>;
  cancelAppointmentByDoctor(request: appointmentaData): Promise<Cancelres>;
}
