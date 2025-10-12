import { PrescriptionData, PrescriptionResponse, FetchPrescriptionRequest, FetchPrescriptionResponse } from "../../types/Doctor.interface";


export interface IPriscriptionRepo {
   createPrescription(
     prescriptionData: PrescriptionData
   ): Promise<PrescriptionResponse>;
   fetchPrescription(
     request: FetchPrescriptionRequest
   ): Promise<FetchPrescriptionResponse>;
}
