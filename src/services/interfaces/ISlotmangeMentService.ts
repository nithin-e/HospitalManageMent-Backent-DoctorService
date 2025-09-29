import { AppointmentSlotsData, DbResponse, FetchAppointmentSlotsRequest, FetchAppointmentSlotsResponse, FetchDoctorSlotsResponse } from "../../types/Doctor.interface";

export interface ISlotmanageMentService {
     fetchAppointmentSlots(
       request: FetchAppointmentSlotsRequest
     ): Promise<FetchAppointmentSlotsResponse>;

    getDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse>;

    createAppointmentSlot( appointmentData: AppointmentSlotsData):Promise<DbResponse>

}