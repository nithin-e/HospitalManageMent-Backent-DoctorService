import { IAppointmentService } from '../interfaces/IAppontment.service';
import {
    AllAppointmentsResponse,
    appointmentaData,
    AppointmentRequest,
    AppointmentResponse,
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

            // Pass to repository
            return await this._appointmentRepository.createAppointment(
                appointmentData
            );
        } catch (error) {
            console.error('Error in service layer:', error);
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
            console.error('Error in fetching single user use case:', error);
            throw error;
        }
    };

    fetchAllUserAppointments = async (
        page: number,
        limit: number
    ): Promise<AllAppointmentsResponse> => {
        try {
            const response =
                await this._appointmentRepository.fetchAllUserAppointments(
                    page,
                    limit
                );
            return response;
        } catch (error) {
            console.error(
                'Error in fetching all user appointments service:',
                error
            );
            throw error;
        }
    };

    cancelUserAppointment = async (
        appointmentId: CancelAppointmentRequest['appointmentId']
    ): Promise<CancelAppointmentResponse> => {
        try {
            if (!appointmentId) {
                throw new Error('Appointment ID is required');
            }

            const response =
                await this._appointmentRepository.cancelUserAppointment(
                    appointmentId
                );

            return response;
        } catch (error) {
            console.error('Error in cancelling appointment service:', error);
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
            console.error('Error in service layer:', error);
            throw error;
        }
    };

    /**
     * Cancels appointment requested by a user.
     *
     * @param cancelData - user cancel request
     * @returns cancel response with status and message
     */

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
            console.error('Error in service layer:', error);
            return {
                success: false,
                message: 'Failed to cancel appointment in service layer',
                error: error instanceof Error ? error.message : 'Unknown error',
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

            console.log('Service Layer - Processing params:', repoParams);

            const result =
                await this._appointmentRepository.filteringDoctorAppoinments(
                    repoParams
                );

            return result;
        } catch (error) {
            console.error(
                'Service Layer Error - filteringDoctorAppoinments:',
                error
            );

            return {
                appointments: [],
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
                totalCount: 0,
                totalPages: 0,
                currentPage: params.page || 1,
            };
        }
    }
}
