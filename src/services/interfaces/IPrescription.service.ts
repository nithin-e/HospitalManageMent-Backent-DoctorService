import {
    PrescriptionData,
    PrescriptionResponse,
    FetchPrescriptionRequest,
    FetchPrescriptionResponse,
} from '../../types/Doctor.interface';

export interface IPrescriptionService {
    createPrescription(data: PrescriptionData): Promise<PrescriptionResponse>;
    getPrescription(
        request: FetchPrescriptionRequest
    ): Promise<FetchPrescriptionResponse>;
}
