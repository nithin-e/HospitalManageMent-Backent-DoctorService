import { appointmentaData } from "../../controllerr/implementation/StoreAppointmentSlots_Controller";
import { AppointmentSlotsData, Cancelres, DbResponse, FetchDoctorSlotsRequest, FetchDoctorSlotsResponse, RescheduleAppointmentRequest, RescheduleAppointmentResponse } from "../../doctorInterFace/IdoctorType";
import { CancelData, CancelResponse, FetchPrescriptionRequest, FetchPrescriptionResponse, PrescriptionData, PrescriptionResponse } from "../../repositoriess/implementation/StoreAppointmentSlots_Repo";




export interface IStoreAppointmentSlotsService {
    storeAppointment_Slots(appointmentData:AppointmentSlotsData): Promise<DbResponse>;
    fetchDoctor__Slots(email:string): Promise<FetchDoctorSlotsResponse>;
    slotReschedule__Appointment(rescheduleData: RescheduleAppointmentRequest): Promise<RescheduleAppointmentResponse>;
    CancelingAppointMent__UserSide(cancelData: CancelData): Promise<CancelResponse>;
    Creating_Prescription(PrescriptionData: PrescriptionData): Promise<PrescriptionResponse>;
    fetching__Prescription( request: FetchPrescriptionRequest): Promise<FetchPrescriptionResponse>;
    doctorCancelling_UserAppointment( request: appointmentaData): Promise<Cancelres>;
}
   