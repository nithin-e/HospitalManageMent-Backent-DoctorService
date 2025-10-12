import * as grpc from '@grpc/grpc-js';
import {
    PrescriptionData,
    PrescriptionResponse,
    FetchPrescriptionRequest,
    FetchPrescriptionResponse,
} from '../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { IPrescriptionService } from '../services/interfaces/IPrescription.service';
import { Response, Request } from 'express';

@injectable()
export class PrescriptionController {
    constructor(
        @inject(TYPES.PriscriptionService)
        private _priscriptionService: IPrescriptionService
    ) {}

    createPrescription = async (req: Request, res: Response): Promise<void> => {
        try {
            const prescriptionData = req.body;

            const response = await this._priscriptionService.createPrescription(
                prescriptionData
            );

            res.status(201).json({
                success: true,
                message: 'Prescription created successfully',
                data: response,
            });
        } catch (error) {
            console.error('REST createPrescription error:', error);
            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            });
        }
    };

    fetchPrescription = async (req: Request, res: Response): Promise<void> => {
        try {
            const fetchRequest = req.body;

            const response = await this._priscriptionService.getPrescription(
                fetchRequest
            );

            res.status(200).json({
                success: true,
                message: 'Prescriptions fetched successfully',
                data: response,
            });
        } catch (error) {
            console.error('REST fetchPrescription error:', error);
            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            });
        }
    };
}
