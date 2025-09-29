import { PrescriptionData, PrescriptionResponse, FetchPrescriptionRequest, FetchPrescriptionResponse } from "../../types/Doctor.interface";


export interface IPriscriptionService {
    createPrescription(data: PrescriptionData): Promise<PrescriptionResponse>;
    getPrescription(
      request: FetchPrescriptionRequest
    ): Promise<FetchPrescriptionResponse>;
}
