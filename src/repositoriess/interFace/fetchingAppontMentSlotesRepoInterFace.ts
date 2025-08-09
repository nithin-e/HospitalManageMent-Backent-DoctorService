import { AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, MongoAppointment, UserAppointmentsResponse } from "../../doctorInterFace/IdoctorType";

export interface IfetchAppontMentSlotesRepo {
    fetching__AppontMentSlotes(request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse>;
    making__Appoint__ment(appointmentData: AppointmentRequest): Promise<AppointmentResponse>;
    fetching_User__ApointMents (email:string): Promise<UserAppointmentsResponse>;
    fetching_All__User__ApointMents (): Promise<IAppointment[]>;
    cancelling_UserAppointment__DueToUser (appointmentId: CancelAppointmentRequest['appointmentId']): Promise<CancelAppointmentResponse>;

}

