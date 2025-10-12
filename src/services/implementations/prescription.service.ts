import { inject, injectable } from 'inversify';
import {
    PrescriptionResponse,
    FetchPrescriptionRequest,
    FetchPrescriptionResponse,
    PrescriptionData,
} from '../../types/Doctor.interface';
import { TYPES } from '../../types/inversify';
import { IPriscriptionRepo } from '../../repositories/interfaces/IPriscription.repository';
import { IPrescriptionService } from '../interfaces/IPrescription.service';

@injectable()
export class PrescriptionService implements IPrescriptionService {
    constructor(
        @inject(TYPES.PriscriptionRepository)
        private _PrescriptionRepo: IPriscriptionRepo
    ) {}

    createPrescription = async (
        PrescriptionData: PrescriptionData
    ): Promise<PrescriptionResponse> => {
        try {
            const response = await this._PrescriptionRepo.createPrescription(
                PrescriptionData
            );
            return response;
        } catch (error) {
            console.error('Error in service layer:', error);
            throw error;
        }
    };

    getPrescription = async (
        request: FetchPrescriptionRequest
    ): Promise<FetchPrescriptionResponse> => {
        try {
            return await this._PrescriptionRepo.fetchPrescription(request);
        } catch (error) {
            console.error('Error in service layer:', error);
            throw error;
        }
    };
}
