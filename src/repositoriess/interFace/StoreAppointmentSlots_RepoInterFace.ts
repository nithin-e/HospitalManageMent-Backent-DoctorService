import { appointmentaData } from "../../controllerr/implementation/StoreAppointmentSlots_Controller";
import { AppointmentSlotsData, Cancelres, DbResponse, FetchDoctorSlotsRequest, FetchDoctorSlotsResponse, RescheduleAppointmentRequest, RescheduleAppointmentResponse } from "../../doctorInterFace/IdoctorType";
import { CancelData, CancelResponse, FetchPrescriptionRequest, FetchPrescriptionResponse, PrescriptionData, PrescriptionResponse } from "../implementation/StoreAppointmentSlots_Repo";

export interface IAppointmentSlotsRepository {
    storeAppointmentSlots(appointmentData: AppointmentSlotsData): Promise<DbResponse>;
    fetchDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse>;
    rescheduleAppointment(rescheduleData: RescheduleAppointmentRequest): Promise<RescheduleAppointmentResponse>;
    cancelAppointmentByUser(cancelData: CancelData): Promise<CancelResponse>;
    createPrescription(prescriptionData: PrescriptionData): Promise<PrescriptionResponse>;
    fetchPrescription(request: FetchPrescriptionRequest): Promise<FetchPrescriptionResponse>;
    cancelAppointmentByDoctor(appointmentData: appointmentaData): Promise<Cancelres>;
}

