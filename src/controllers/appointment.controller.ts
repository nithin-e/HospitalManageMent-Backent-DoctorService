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
    Data,
    FetchDoctorSlotsRequest,
    filteringDoctorAppoinmentsRequest,
    filteringDoctorAppoinmentsResponse,
    RescheduleAppointmentRequest,
    RescheduleAppointmentResponse,
    UserAppointmentsRequest,
    UserAppointmentsResponse,
} from '../types/Doctor.interface';
import { Response, Request } from 'express';

import { TYPES } from '../types/inversify';
import { FilteringDoctorAppointmentsMapper } from '../mapers/chatMessage.mapper';
import { IAppointmentService } from '../services/interfaces/IAppontment.service';
import { inject, injectable } from 'inversify';

export interface GrpcCall {
    request: FetchDoctorSlotsRequest;
}

@injectable()
export class AppointmentController {
    constructor(
        @inject(TYPES.AppointmentService)
        private _appointMentService: IAppointmentService
    ) {}

   makeAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
      const appointmentData = req.body;

      const dbResponse = await this._appointMentService.makeAppointment(appointmentData);

      res.status(200).json({
        success: true,
        message: "Appointment booked successfully",
        appointment_id: dbResponse.id,
      });
    } catch (error) {
      console.error("Error in makeAppointment controller:", error);
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

            // Send success response
            res.status(200).json({
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
            console.error('REST fetchUserAppointments error:', error);
            res.status(500).json({
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            });
        }
    };

    fetchAllUserAppointments = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            let { page = '1', limit = '10' } = req.query;

            // Convert and validate pagination values
            const validatedPage = Math.max(1, Number(page));
            const validatedLimit = Math.min(Math.max(1, Number(limit)), 100);

            // Call your appointment service method
            const response =
                await this._appointMentService.fetchAllUserAppointments(
                    validatedPage,
                    validatedLimit
                );

            // Send success response
            res.status(200).json({
                success: true,
                message: 'Appointments fetched successfully',
                appointments: response.appointments,
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                totalAppointments: response.totalAppointments,
                limit: response.limit,
                hasNextPage: response.hasNextPage,
                hasPrevPage: response.hasPrevPage,
            });
        } catch (error) {
            console.error('REST fetchAllUserAppointments error:', error);
            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            });
        }
    };

    cancelUserAppointment = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { appointmentId } = req.body;

            // Call service method
            const response =
                await this._appointMentService.cancelUserAppointment(
                    appointmentId
                );

            // Send success response
            res.status(200).json({
                success: response.success,
                message:
                    response.message || 'Appointment cancelled successfully',
                data: response,
            });
        } catch (error) {
            console.error('REST cancelUserAppointment error:', error);
            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
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

            console.log(
                '✅ Appointment rescheduled successfully via RabbitMQ:',
                dbResponse
            );
            return {
                success: true,
                data: dbResponse,
                message: 'Appointment rescheduled successfully',
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message:
                    (error as Error).message || 'Unexpected error occurred',
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

            res.status(200).json({
                success: true,
                message: 'Appointment cancelled successfully by user',
                data: response,
            });
        } catch (error) {
            console.error('REST cancelAppointmentUserSide error:', error);
            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
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

            const response =
                FilteringDoctorAppointmentsMapper.toGrpcResponse(result);

            res.status(200).json({
                success: true,
                message: 'Doctor appointments filtered successfully',
                data: response,
            });
        } catch (error) {
            console.error('REST filteringDoctorAppointments error:', error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Internal server error';

            const errorResponse =
                FilteringDoctorAppointmentsMapper.toGrpcError(errorMessage);

            res.status(500).json({
                success: false,
                message: errorMessage,
                error: errorResponse,
            });
        }
    };
}
