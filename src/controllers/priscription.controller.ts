import * as grpc from '@grpc/grpc-js';
import {
    PrescriptionData,
    PrescriptionResponse,
    FetchPrescriptionRequest,
    FetchPrescriptionResponse,
} from '../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { IPriscriptionService } from '../services/interfaces/IprescriptionService';

@injectable()
export class PrescriptionController {
    constructor(
        @inject(TYPES.PriscriptionService)
        private _priscriptionService: IPriscriptionService
    ) {}

    CreatingPrescription = async (
        call: { request: PrescriptionData },
        callback: (
            error: grpc.ServiceError | null,
            response?: PrescriptionResponse
        ) => void
    ) => {
        try {
            const res = await this._priscriptionService.createPrescription(
                call.request
            );
            callback(null, res);
        } catch (error) {
            console.log('Error in notification controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            // callback(grpcError, null);
        }
    };

    fetchPrescription = async (
        call: { request: FetchPrescriptionRequest },
        callback: (
            error: grpc.ServiceError | null,
            response?: FetchPrescriptionResponse
        ) => void
    ) => {
        try {
            const res = await this._priscriptionService.getPrescription(
                call.request
            );
            callback(null, res);
        } catch (error) {
            console.log('Error in prescription controller:', error);
            const grpcError = {
                code: grpc.status.INTERNAL,
                message: (error as Error).message,
            };
            // callback(grpcError, null);
        }
    };
}
