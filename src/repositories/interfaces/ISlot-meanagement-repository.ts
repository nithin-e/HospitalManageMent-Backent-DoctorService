import {
    AppointmentSlotsData,
    DbResponse,
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    FetchDoctorSlotsResponse,
} from '../../types/Doctor.interface';

export interface ISlotManagementRepository {
    fetchAppointmentSlots(
        request: FetchAppointmentSlotsRequest
    ): Promise<FetchAppointmentSlotsResponse>;

    storeAppointmentSlots(
        appointmentData: AppointmentSlotsData
    ): Promise<DbResponse>;

    fetchDoctorSlots(email: string): Promise<FetchDoctorSlotsResponse>;
}
