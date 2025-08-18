import { appointmentaData } from "../../controllerr/implementation/StoreAppointmentSlots_Controller";
import { AppointmentSlotsData, Cancelres, DbResponse, FetchDoctorSlotsRequest, FetchDoctorSlotsResponse, RescheduleAppointmentRequest, RescheduleAppointmentResponse } from "../../doctorInterFace/IdoctorType";
import { CancelData, CancelResponse, FetchPrescriptionRequest, FetchPrescriptionResponse, PrescriptionData, PrescriptionResponse } from "../../repositoriess/implementation/StoreAppointmentSlots_Repo";




export interface IStoreAppointmentSlotsService {
  createAppointmentSlot(data: AppointmentSlotsData): Promise<DbResponse>;
  getDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse>;
  rescheduleAppointment(data: RescheduleAppointmentRequest): Promise<RescheduleAppointmentResponse>;
  cancelAppointmentByUser(data: CancelData): Promise<CancelResponse>;
  createPrescription(data: PrescriptionData): Promise<PrescriptionResponse>;
  getPrescription(request: FetchPrescriptionRequest): Promise<FetchPrescriptionResponse>;
  cancelAppointmentByDoctor(request: appointmentaData): Promise<Cancelres>;
}
   