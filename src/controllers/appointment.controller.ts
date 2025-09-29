import * as grpc from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';
import {
    AllAppointmentsResponse,
    appointmentaData,
    AppointmentRequest,
    CancelAppointmentRequest,
    CancelAppointmentResponse,
    CancelData,
    Cancelres,
    CancelResponse,
    ControllerAppointmentResponse,
    FetchDoctorSlotsRequest,
    filteringDoctorAppoinmentsRequest,
    filteringDoctorAppoinmentsResponse,
    RescheduleAppointmentRequest,
    RescheduleAppointmentResponse,
    UserAppointmentsRequest,
    UserAppointmentsResponse,
} from '../types/Doctor.interface';
import { CancelRequester } from '@grpc/grpc-js/build/src/client-interceptors';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { FilteringDoctorAppointmentsMapper } from '../mapers/chatMessage.mapper';
import { IFetchAppointmentSlotService } from '../services/interfaces/IFetchAppontMentSlotes';

export interface GrpcCall {
    request: FetchDoctorSlotsRequest;
}

@injectable()
export class AppointmentController {
    constructor(
        @inject(TYPES.AppointmentService)
        private _appointMentService: IFetchAppointmentSlotService
    ) {}

    makeAppointment = async (
        call: { request: AppointmentRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: ControllerAppointmentResponse
        ) => void
    ) => {
        try {
            const dbResponse = await this._appointMentService.makeAppointment(
                call.request
            );

            const response: ControllerAppointmentResponse = {
                success: true,
                message: 'Appointment booked successfully',
                appointment_id: dbResponse.id,
            };

            callback(null, response);
        } catch (error) {
            console.log('Error in controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            // callback(null,grpcError);
        }
    };

    fetchUserAppointments = async (
        call: { request: UserAppointmentsRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: UserAppointmentsResponse
        ) => void
    ) => {
        try {
            const { email, page = 1, limit = 3 } = call.request;

            const validatedPage = Math.max(1, page);
            const validatedLimit = Math.min(Math.max(1, limit), 100);

            const response =
                await this._appointMentService.fetchUserAppointments(
                    email,
                    validatedPage,
                    validatedLimit
                );

            callback(null, {
                appointments: response.appointments,
                success: response.success,
                message: response.message,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalAppointments: response.totalAppointments,
                limit: response.limit,
                hasNextPage: response.hasNextPage,
                hasPrevPage: response.hasPrevPage,
            });
        } catch (error) {
            console.log('Error fetching user appointments:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            // callback(grpcError,null);
        }
    };

    fetchAllUserAppointments = async (
        call: { request: { page: number; limit: number } },
        callback: (
            error: grpc.ServiceError | null,
            response?: AllAppointmentsResponse
        ) => void
    ) => {
        try {
            const { page, limit } = call.request;

            const response =
                await this._appointMentService.fetchAllUserAppointments(
                    page,
                    limit
                );

            const grpcResponse: AllAppointmentsResponse = {
                appointments: response.appointments,
                success: true,
                message: 'Appointments fetched successfully',
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalAppointments: response.totalAppointments,
                limit: response.limit,
                hasNextPage: response.hasNextPage,
                hasPrevPage: response.hasPrevPage,
            };

            callback(null, grpcResponse);
        } catch (error) {
            console.log('Error fetching user appointments:', error);
        }
    };

    cancelUserAppointment = async (
        call: { request: CancelAppointmentRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: CancelAppointmentResponse
        ) => void
    ) => {
        try {
            const { appointmentId } = call.request;

            const response =
                await this._appointMentService.cancelUserAppointment(
                    appointmentId
                );

            callback(null, response);
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
        }
    };

    rescheduleAppointment = async (
        call: { request: RescheduleAppointmentRequest },
        callback: (
            error: grpc.ServiceError | null,
            response: RescheduleAppointmentResponse | null
        ) => void
    ) => {
        try {
            const dbResponse =
                await this._appointMentService.rescheduleAppointment(
                    call.request
                );

            callback(null, dbResponse);
        } catch (error) {
            console.log('Error in doctor controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            // callback(grpcError, null);
        }
    };

    /**
     * Cancels an appointment from the user side.
     *
     * @param call - gRPC call with cancellation data
     * @param callback - gRPC response callback
     */

    cancelAppointmentUserSide = async (
        call: grpc.ServerUnaryCall<CancelRequester, CancelResponse>,
        callback: grpc.sendUnaryData<CancelResponse>
    ) => {
        try {
            const res = await this._appointMentService.cancelAppointmentByUser(
                call.request as unknown as CancelData
            );

            callback(null, res);
        } catch (error) {
            console.log('Error in notification controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            callback(grpcError, null);
        }
    };

    /**
     * Creates a prescription for an appointment.
     *
     * @param call - gRPC call with prescription data
     * @param callback - gRPC response callback
     */

    /**
     * Cancels an appointment from the doctor side.
     *
     * @param call - gRPC call with appointment data
     * @param callback - gRPC response callback
     */
    doctorCancelAppointment = async (
        call: { request: appointmentaData },
        callback: (
            error: grpc.ServiceError | null,
            response?: Cancelres
        ) => void
    ) => {
        try {
            const res =
                await this._appointMentService.cancelAppointmentByDoctor(
                    call.request
                );
            callback(null, res);
        } catch (error) {
            const grpcError: grpc.ServiceError = {
                ...(error instanceof Error ? error : new Error(String(error))),
                code: status.INTERNAL,
                details:
                    error instanceof Error
                        ? error.message
                        : 'Failed to cancel appointment',
                metadata: new grpc.Metadata(),
            };

            if (error instanceof Error && error.message.includes('not found')) {
                grpcError.code = status.NOT_FOUND;
                grpcError.details = 'Appointment not found';
            }

            callback(grpcError);
        }
    };

    filteringDoctorAppoinments = async (
        call: grpc.ServerUnaryCall<
            filteringDoctorAppoinmentsRequest,
            filteringDoctorAppoinmentsResponse
        >,
        callback: grpc.sendUnaryData<filteringDoctorAppoinmentsResponse>
    ): Promise<void> => {
        try {
            const params = FilteringDoctorAppointmentsMapper.toServiceParams(
                call.request
            );

            const result =
                await this._appointMentService.filteringDoctorAppoinments(
                    params
                );

            const grpcResponse =
                FilteringDoctorAppointmentsMapper.toGrpcResponse(result);

            callback(null, grpcResponse);
        } catch (error) {
            const errorResponse = FilteringDoctorAppointmentsMapper.toGrpcError(
                error instanceof Error ? error.message : 'Internal server error'
            );

            callback(null, errorResponse);
        }
    };
}
