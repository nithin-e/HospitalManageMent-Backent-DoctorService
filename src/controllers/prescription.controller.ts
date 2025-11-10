import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { IPrescriptionService } from '../services/interfaces/IPrescription.service';
import { Response, Request } from 'express';
import { HttpStatusCode } from '../types/Doctor.interface';
import { PRESCRIPTION_MESSAGES } from '../constants/messages.constant';

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

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: PRESCRIPTION_MESSAGES.CREATE.SUCCESS,
                data: response,
            });
        } catch (error) {
            console.error('REST createPrescription error:', error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : PRESCRIPTION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
            });
        }
    };

    fetchPrescription = async (req: Request, res: Response): Promise<void> => {
        try {
            const fetchRequest = req.body;

            const response = await this._priscriptionService.getPrescription(
                fetchRequest
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: PRESCRIPTION_MESSAGES.FETCH.SUCCESS,
                data: response,
            });
        } catch (error) {
            console.error('REST fetchPrescription error:', error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : PRESCRIPTION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR;

            const statusCode =
                errorMessage === PRESCRIPTION_MESSAGES.FETCH.NOT_FOUND ||
                errorMessage ===
                    PRESCRIPTION_MESSAGES.FETCH.APPOINTMENT_NOT_FOUND
                    ? HttpStatusCode.NOT_FOUND
                    : HttpStatusCode.INTERNAL_SERVER_ERROR;

            res.status(statusCode).json({
                success: false,
                message: errorMessage,
            });
        }
    };
}
