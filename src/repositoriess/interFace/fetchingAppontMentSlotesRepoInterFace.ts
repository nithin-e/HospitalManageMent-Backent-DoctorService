import { AppointmentRequest, AppointmentResponse, CancelAppointmentRequest, CancelAppointmentResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, IAppointment, MongoAppointment, UserAppointmentsResponse } from "../../doctorInterFace/IdoctorType";

export interface IAppointmentRepository {
  fetchAppointmentSlots(request: FetchAppointmentSlotsRequest): Promise<FetchAppointmentSlotsResponse>;
  createAppointment(appointmentData: AppointmentRequest): Promise<AppointmentResponse>;
  fetchUserAppointments(email: string): Promise<UserAppointmentsResponse>;
  fetchAllUserAppointments(): Promise<IAppointment[]>;
  cancelUserAppointment(appointmentId: CancelAppointmentRequest['appointmentId']): Promise<CancelAppointmentResponse>;
}

