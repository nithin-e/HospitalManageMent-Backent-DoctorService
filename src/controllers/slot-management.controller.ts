import * as grpc from '@grpc/grpc-js';
import {
    FetchAppointmentSlotsRequest,
    FetchAppointmentSlotsResponse,
    AppointmentSlotsData,
    DbResponse,
    GrpcCallbackk,
    FetchDoctorSlotsRequest,
} from '../types/Doctor.interface';
import { GrpcCall } from './appointment.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { ISlotmanageMentService } from '../services/interfaces/ISlotmangeMentService';

@injectable()
export class SlotManagementController {
    constructor(
        @inject(TYPES.SlotmanagementService)
        private _sloteManageMentService: ISlotmanageMentService
    ) {}

    fetchAppointmentSlots = async (
        call: { request: FetchAppointmentSlotsRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: FetchAppointmentSlotsResponse
        ) => void
    ) => {
        try {
            const dbResponse =
                await this._sloteManageMentService.fetchAppointmentSlots(
                    call.request
                );

            callback(null, dbResponse);
        } catch (error) {
            console.log('Error in controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            // callback(grpcError);
        }
    };

    storeAppointmentSlots = async (
        call: grpc.ServerUnaryCall<AppointmentSlotsData, DbResponse>,
        callback: grpc.sendUnaryData<DbResponse>
    ) => {
        try {
            const dbResponse =
                await this._sloteManageMentService.createAppointmentSlot(
                    call.request
                );

            callback(null, dbResponse);
        } catch (error) {
            console.log('Error in doctor controller:', error);
            callback(
                {
                    code: grpc.status.INTERNAL,
                    message: (error as Error).message,
                },
                null
            );
        }
    };

    fetchDoctorSlots = async (
        call: GrpcCall,
        callback: GrpcCallbackk
    ): Promise<void> => {
        try {
            const request: FetchDoctorSlotsRequest = call.request;

            const { email } = call.request;

            const response = await this._sloteManageMentService.getDoctorSlots(
                email
            );

            callback(null, response);
        } catch (error) {
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            callback(grpcError, null);
        }
    };
}
