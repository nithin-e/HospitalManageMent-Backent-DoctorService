import {
  appointmentaData,
  AppointmentSlotsData,
  CancelData,
  Cancelres,
  CancelResponse,
  DbResponse,
  FetchDoctorSlotsRequest,
  FetchDoctorSlotsResponse,
  FetchPrescriptionRequest,
  FetchPrescriptionResponse,
  PrescriptionData,
  PrescriptionResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../interfaces/Doctor.interface";

export interface IAppointmentSlotsRepository {
  storeAppointmentSlots(
    appointmentData: AppointmentSlotsData
  ): Promise<DbResponse>;
  fetchDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse>;
  rescheduleAppointment(
    rescheduleData: RescheduleAppointmentRequest
  ): Promise<RescheduleAppointmentResponse>;
  cancelAppointmentByUser(cancelData: CancelData): Promise<CancelResponse>;
  createPrescription(
    prescriptionData: PrescriptionData
  ): Promise<PrescriptionResponse>;
  fetchPrescription(
    request: FetchPrescriptionRequest
  ): Promise<FetchPrescriptionResponse>;
  cancelAppointmentByDoctor(
    appointmentData: appointmentaData
  ): Promise<Cancelres>;
}
