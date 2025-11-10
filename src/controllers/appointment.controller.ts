import * as grpc from '@grpc/grpc-js';
import { status } from '@grpc/grpc-js';
import {
    AfterTheConsultationRequest,
    AfterTheConsultationResponse,
    appointmentaData,
    AppointmentRequest,
    Cancelres,
    Data,
    FetchDoctorSlotsRequest,
    HttpStatusCode,
    PaymentEventData,
    RescheduleAppointmentRequest,
} from '../types/Doctor.interface';
import { Response, Request } from 'express';
import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { TYPES } from '../types/inversify';
import { FilteringDoctorAppointmentsMapper } from '../mapers/chatMessage.mapper';
import { IAppointmentService } from '../services/interfaces/IAppontment.service';
import { inject, injectable } from 'inversify';
import { MESSAGES } from '../constants/messages.constant';

export interface GrpcCall {
    request: FetchDoctorSlotsRequest;
}

@injectable()
export class AppointmentController {
    constructor(
        @inject(TYPES.AppointmentService)
        private _appointMentService: IAppointmentService
    ) {}

    handleAppointmentFromPayment = async (eventData: PaymentEventData) => {
        try {
            const appointmentData: AppointmentRequest = {
                patientName: eventData?.customer_details?.name || '',
                patientEmail: eventData?.metadata?.patientEmail || '',
                patientPhone: eventData?.customer_details?.phone || '',
                appointmentDate: eventData?.metadata?.appointmentDate || '',
                appointmentTime: eventData?.metadata?.appointmentTime || '',
                notes: eventData?.metadata?.notes || '',
                doctorName: eventData?.metadata?.doctorName || '',
                specialty: eventData?.metadata?.specialty || '',
                userEmail: eventData?.metadata?.userEmail || '',
                userId: eventData?.metadata?.patientId || '',
                doctorId: eventData?.metadata?.doctorId || '',
            };

            const dbResponse = await this._appointMentService.makeAppointment(
                appointmentData
            );
        } catch (error) {
            console.error(MESSAGES.CREATE.PAYMENT_FAILED, error);
        }
    };

    fetchUserAppointments = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { email, page = '1', limit = '3' } = req.body;

            const validatedPage = Math.max(1, Number(page));
            const validatedLimit = Math.min(Math.max(1, Number(limit)), 100);

            const response =
                await this._appointMentService.fetchUserAppointments(
                    email,
                    validatedPage,
                    validatedLimit
                );

            res.status(HttpStatusCode.OK).json({
                success: response.success,
                message: response.message,
                appointments: response.appointments,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalAppointments: response.totalAppointments,
                limit: response.limit,
                hasNextPage: response.hasNextPage,
                hasPrevPage: response.hasPrevPage,
            });
        } catch (error) {
            console.error(' error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    fetchAllUserAppointments = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { page = '1', limit = '10', email } = req.body;

            const validatedPage = Math.max(1, Number(page));
            const validatedLimit = Math.min(Math.max(1, Number(limit)), 100);

            const response =
                await this._appointMentService.fetchAllUserAppointments(
                    email,
                    validatedPage,
                    validatedLimit
                );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: MESSAGES.FETCH.ALL_SUCCESS,
                appointments: response.appointments,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalAppointments: response.totalAppointments,
                limit: response.limit,
                hasNextPage: response.hasNextPage,
                hasPrevPage: response.hasPrevPage,
            });
        } catch (error) {
            console.error('error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    cancelUserAppointment = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { appointmentId } = req.body;

            const response =
                await this._appointMentService.cancelUserAppointment(
                    appointmentId
                );

            res.status(HttpStatusCode.OK).json({
                success: response.success,
                message: response.message || MESSAGES.CANCEL.SUCCESS,
                data: response,
            });
        } catch (error) {
            console.error(' error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    rescheduleAppointment = async (
        rescheduleData: RescheduleAppointmentRequest
    ): Promise<Data> => {
        try {
            // Call your service layer
            const dbResponse =
                await this._appointMentService.rescheduleAppointment(
                    rescheduleData
                );

            return {
                success: true,
                data: dbResponse,
                message: MESSAGES.RESCHEDULE.SUCCESS,
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message:
                    (error as Error).message ||
                    MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            };
        }
    };

    cancelAppointmentUserSide = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const cancelData = req.body;

            const response =
                await this._appointMentService.cancelAppointmentByUser(
                    cancelData
                );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: MESSAGES.CANCEL.USER_SUCCESS,
                data: response,
            });
        } catch (error) {
            console.error(' error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

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
                        : MESSAGES.CANCEL.FAILED,
                metadata: new grpc.Metadata(),
            };

            if (error instanceof Error && error.message.includes('not found')) {
                grpcError.code = status.NOT_FOUND;
                grpcError.details = MESSAGES.CANCEL.NOT_FOUND;
            }

            callback(grpcError);
        }
    };

    filteringDoctorAppointments = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const params = FilteringDoctorAppointmentsMapper.toServiceParams(
                req.body
            );

            const result =
                await this._appointMentService.filteringDoctorAppoinments(
                    params
                );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: MESSAGES.FILTER.SUCCESS,
                data: result,
            });
        } catch (error) {
            console.error(' error:', error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : MESSAGES.ERROR.INTERNAL_SERVER_ERROR;

            const errorResponse =
                FilteringDoctorAppointmentsMapper.toGrpcError(errorMessage);

            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: errorMessage,
                error: errorResponse,
            });
        }
    };

    updateAppointmentAfterConsultation = async (
        call: ServerUnaryCall<
            AfterTheConsultationRequest,
            AfterTheConsultationResponse
        >,
        callback: sendUnaryData<AfterTheConsultationResponse>
    ): Promise<AfterTheConsultationResponse> => {
        try {
            const { appointmentId, endedBy } = call.request;

            if (!appointmentId || !endedBy) {
                throw new Error(MESSAGES.VALIDATION.BOTH_FIELDS_REQUIRED);
            }

            const result =
                await this._appointMentService.updateAppointmentAfterConsultation(
                    {
                        appointmentId,
                        endedBy,
                    }
                );

            const response: AfterTheConsultationResponse = {
                success: true,
                patientEmail: result?.patientEmail || '',
            };

            callback(null, response);
            return response;
        } catch (error) {
            console.error('error:', error);
            throw error;
        }
    };
}
