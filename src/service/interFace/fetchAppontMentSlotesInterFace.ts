import { AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, UserAppointmentsResponse } from "../../doctorInterFace/IdoctorType";

export interface IFetchAppointmentSlotsService {
  fetchAppointmentSlots(request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse>;
  makeAppointment(request: AppointmentRequest): Promise<AppointmentResponse>;
  fetchUserAppointments(email: string): Promise<UserAppointmentsResponse>;
  fetchAllUserAppointments(): Promise<IAppointment[]>;
  cancelUserAppointment(appointmentId: CancelAppointmentRequest["appointmentId"]): Promise<CancelAppointmentResponse>;
}


    