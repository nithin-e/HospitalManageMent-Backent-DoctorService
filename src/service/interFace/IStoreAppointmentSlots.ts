import {
  appointmentaData,
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
} from "../../interfaces/Doctor.interface";

export interface IStoreAppointmentSlotsService {
  createAppointmentSlot(data: AppointmentSlotsData): Promise<DbResponse>;
  getDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse>;
  rescheduleAppointment(
    data: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse>;
  cancelAppointmentByUser(data: CancelData): Promise<CancelResponse>;
  createPrescription(data: PrescriptionData): Promise<PrescriptionResponse>;
  getPrescription(
    request: FetchPrescriptionRequest
  ): Promise<FetchPrescriptionResponse>;
  cancelAppointmentByDoctor(request: appointmentaData): Promise<Cancelres>;
}
