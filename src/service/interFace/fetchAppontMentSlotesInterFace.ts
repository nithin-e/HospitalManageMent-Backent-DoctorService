import { AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, UserAppointmentsResponse } from "../../doctorInterFace/IdoctorType";

export interface IfetchAppontMentSlotesService {
    fetchingAppontMent__Slotes(request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse>;
    Making_Appoint_Ment(request: AppointmentRequest): Promise<AppointmentResponse>;
    fecting_UserAppointments(email:string): Promise<UserAppointmentsResponse>;
    fecting_UserAllAppointments(call: any, callback: any): Promise<any>;
    fecting_UserAllAppointments(): Promise<IAppointment[]>;
    cancellingUserAppointment__DueToUser(appointmentId: CancelAppointmentRequest['appointmentId']): Promise<CancelAppointmentResponse>;
}



    