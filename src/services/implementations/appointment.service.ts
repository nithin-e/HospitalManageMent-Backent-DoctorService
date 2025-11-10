import { IAppointmentService } from '../interfaces/IAppontment.service';
import {
    AllAppointmentsResponse,
    appointmentaData,
    AppointmentRequest,
    AppointmentResponse,
    AppointmentUpdateParams,
    AppointmentUpdateResponse,
    CancelAppointmentRequest,
    CancelAppointmentResponse,
    CancelData,
    Cancelres,
    CancelResponse,
    FilteringResponse,
    RescheduleAppointmentRequest,
    RescheduleAppointmentResponse,
    SearchParam,
    UserAppointmentsResponse,
} from '../../types/Doctor.interface';
import { IAppointmentRepository } from '../../repositories/interfaces/IAppointment.repository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/inversify';
import { IPriscriptionRepo } from '../../repositories/interfaces/IPriscription.repository';
import { MESSAGES } from '../../constants/messages.constant';
import { FilteringDoctorAppointmentsMapper } from '../../mapers/chatMessage.mapper';

@injectable()
export class AppontMentService implements IAppointmentService {
    constructor(
        @inject(TYPES.AppointmentRepository)
        private _appointmentRepository: IAppointmentRepository &
            IPriscriptionRepo
    ) {}

    makeAppointment = async (
        request: AppointmentRequest
    ): Promise<AppointmentResponse> => {
        try {
            const appointmentData: AppointmentRequest = {
                patientName: request.patientName,
                patientEmail: request.patientEmail,
                patientPhone: request.patientPhone,
                appointmentDate: request.appointmentDate,
                appointmentTime: request.appointmentTime,
                doctorName: request.doctorName,
                specialty: request.specialty,
                userEmail: request.userEmail,
                notes: request.notes || '',
                userId: request.userId,
                doctorId: request.doctorId,
            };

            return await this._appointmentRepository.createAppointment(
                appointmentData
            );
        } catch (error) {
            console.error(MESSAGES.CREATE.FAILED, error);
            throw error;
        }
    };

    fetchUserAppointments = async (
        email: string,
        page: number = 1,
        limit: number = 3
    ): Promise<UserAppointmentsResponse> => {
        try {
            return await this._appointmentRepository.fetchUserAppointments(
                email,
                page,
                limit
            );
        } catch (error) {
            console.error(MESSAGES.FETCH.FAILED, error);
            throw error;
        }
    };

    fetchAllUserAppointments = async (
        email: string,
        page: number,
        limit: number
    ): Promise<AllAppointmentsResponse> => {
        try {
            const response =
                await this._appointmentRepository.fetchAllUserAppointments(
                    email,
                    page,
                    limit
                );

            return response;
        } catch (error) {
            console.error(MESSAGES.FETCH.ALL_FAILED, error);
            throw error;
        }
    };

    cancelUserAppointment = async (
        appointmentId: CancelAppointmentRequest['appointmentId']
    ): Promise<CancelAppointmentResponse> => {
        try {
            if (!appointmentId) {
                throw new Error(MESSAGES.VALIDATION.APPOINTMENT_ID_REQUIRED);
            }

            const response =
                await this._appointmentRepository.cancelUserAppointment(
                    appointmentId
                );

            return response;
        } catch (error) {
            console.error(MESSAGES.CANCEL.FAILED, error);
            throw error;
        }
    };

    rescheduleAppointment = async (
        rescheduleData: RescheduleAppointmentRequest
    ): Promise<RescheduleAppointmentResponse> => {
        try {
            const response =
                await this._appointmentRepository.rescheduleAppointment(
                    rescheduleData
                );
            return response;
        } catch (error) {
            console.error(MESSAGES.RESCHEDULE.FAILED, error);
            throw error;
        }
    };

    cancelAppointmentByUser = async (
        cancelData: CancelData
    ): Promise<CancelResponse> => {
        try {
            const response =
                await this._appointmentRepository.cancelAppointmentByUser(
                    cancelData
                );
            return response;
        } catch (error) {
            console.error(MESSAGES.CANCEL.FAILED, error);
            return {
                success: false,
                message: MESSAGES.CANCEL.FAILED,
                error:
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            };
        }
    };

    cancelAppointmentByDoctor = async (
        request: appointmentaData
    ): Promise<Cancelres> => {
        try {
            const res =
                await this._appointmentRepository.cancelAppointmentByDoctor(
                    request
                );
            return res;
        } catch (err) {
            console.log(err);
            return {
                success: false,
            };
        }
    };

    async filteringDoctorAppoinments(params: {
        searchQuery?: string;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
        page?: number;
        limit?: number;
        role?: string;
    }): Promise<FilteringResponse> {
        try {
            const {
                searchQuery = '',
                sortBy = 'createdAt',
                sortDirection = 'desc',
                page = 1,
                limit = 50,
                role = '',
            } = params;

            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100);
            const validatedSortDirection =
                sortDirection === 'asc' || sortDirection === 'desc'
                    ? sortDirection
                    : 'desc';

            const repoParams: SearchParam = {
                searchQuery: searchQuery.trim(),
                sortBy: sortBy.trim(),
                sortDirection: validatedSortDirection,
                page: validatedPage,
                limit: validatedLimit,
                role: role.trim(),
            };

            const result =
                await this._appointmentRepository.filteringDoctorAppoinments(
                    repoParams
                );

            return FilteringDoctorAppointmentsMapper.toGrpcResponse(result);
        } catch (error) {
            console.error(MESSAGES.FILTER.FAILED, error);

            return {
                appointments: [],
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
                totalCount: 0,
                totalPages: 0,
                currentPage: params.page || 1,
            };
        }
    }

    updateAppointmentAfterConsultation = async (
        params: AppointmentUpdateParams
    ): Promise<AppointmentUpdateResponse> => {
        try {
            const dbResponse =
                await this._appointmentRepository.updateAppointmentAfterConsultation(
                    params.appointmentId,
                    params.endedBy
                );

            return dbResponse;
        } catch (error) {
            console.error(MESSAGES.UPDATE.AFTER_CONSULTATION_FAILED, error);

            return {
                success: false,
                error: `${MESSAGES.ERROR.SERVICE_LAYER_ERROR}: ${
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR
                }`,
            };
        }
    };
}
