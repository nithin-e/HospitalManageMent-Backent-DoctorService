import { appointmentaData } from "../../controllerr/implementation/StoreAppointmentSlots_Controller";
import { AppointmentSlotsData, Cancelres, DbResponse, FetchDoctorSlotsRequest, FetchDoctorSlotsResponse, RescheduleAppointmentRequest, RescheduleAppointmentResponse } from "../../doctorInterFace/IdoctorType";
import { CancelData, CancelResponse, FetchPrescriptionRequest, FetchPrescriptionResponse, PrescriptionData, PrescriptionResponse } from "../implementation/StoreAppointmentSlots_Repo";

export interface IStoreAppointmentSlots_Repo {
    store__Appointment_Slots(appointmentData: AppointmentSlotsData): Promise<DbResponse>;
    fetch_Doctor__Slots(email:string): Promise<FetchDoctorSlotsResponse>;
    slot_Reschedule_Appointment(rescheduleData: RescheduleAppointmentRequest): Promise<RescheduleAppointmentResponse>;
    Canceling_AppointMent__UserSide(cancelData: CancelData): Promise<CancelResponse>;
    Creating__Prescription(PrescriptionData: PrescriptionData): Promise<PrescriptionResponse>;
    fetching_Prescription(request: FetchPrescriptionRequest): Promise<FetchPrescriptionResponse>;
    doctorCancelling_User_Appointment (appointmentData:appointmentaData):Promise<Cancelres>
}


