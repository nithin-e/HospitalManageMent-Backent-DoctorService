import {
    AllAppointmentsResponse,
    AppointmentRequest,
    AppointmentResponse,
    AppointmentUpdateParams,
    AppointmentUpdateResponse,
    CancelAppointmentRequest,
    CancelAppointmentResponse,
    Data,
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    FilteringResponse,
    UserAppointmentsResponse,
} from '../../types/Doctor.interface';
import { IService } from '../../entities/serviceModel';
import { IStoreAppointmentSlotsService } from './IStore-appointment-slots.service';

export interface IAppointmentService extends IStoreAppointmentSlotsService {
    makeAppointment(request: AppointmentRequest): Promise<AppointmentResponse>;
    fetchUserAppointments(
        email: string,
        page: number,
        limit: number
    ): Promise<UserAppointmentsResponse>;
    fetchAllUserAppointments(
        email: string,
        page: number,
        limit: number
    ): Promise<AllAppointmentsResponse>;
    cancelUserAppointment(
        appointmentId: CancelAppointmentRequest['appointmentId']
    ): Promise<CancelAppointmentResponse>;

    filteringDoctorAppoinments(params: {
        searchQuery?: string;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
        page?: number;
        limit?: number;
        role?: string;
    }): Promise<FilteringResponse>;

    updateAppointmentAfterConsultation(
        params: Data
    ): Promise<AppointmentUpdateResponse>;
}
