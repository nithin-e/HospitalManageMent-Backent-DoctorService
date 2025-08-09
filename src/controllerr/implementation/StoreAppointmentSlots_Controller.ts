import * as grpc from "@grpc/grpc-js";
import { status, Metadata, ServiceError } from '@grpc/grpc-js';
import {
  AppointmentSlotsData,
  Cancelres,
  FetchDoctorSlotsRequest,
  GrpcCallback,
  GrpcCallbackk,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../doctorInterFace/IdoctorType";
import { IStoreAppointmentSlotsService } from "../../service/interFace/StoreAppointmentSlotsInterFace";
import { CancelRequester } from "@grpc/grpc-js/build/src/client-interceptors";
import {
  CancelData,
  CancelResponse,
  FetchPrescriptionRequest,
  FetchPrescriptionResponse,
  PrescriptionData,
  PrescriptionResponse,
} from "../../repositoriess/implementation/StoreAppointmentSlots_Repo";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";


export interface GrpcCall {
  request: FetchDoctorSlotsRequest;
}

export interface GrpcCallOne {
  request: AppointmentSlotsData;
}


  

export interface appointmentaData {
  id:string;
  doctorId?:string;
  date:string;
  time:string;
  is_booked:boolean;
  patientEmail:string;
}

export default class StoreAppointmentSlotsController {
  private storeAppointmentSlotsService: IStoreAppointmentSlotsService;

  constructor(storeAppointmentSlotsService: IStoreAppointmentSlotsService) {
    this.storeAppointmentSlotsService = storeAppointmentSlotsService;
  }

  storeAppointmentSlots = async (call: GrpcCallOne, callback: GrpcCallback) => {
    try {
      console.log("Doctor slots processed in controller:", call.request);

      const dbResponse =
        await this.storeAppointmentSlotsService.storeAppointment_Slots(
          call.request
        );

      callback(null, dbResponse);
    } catch (error) {
      console.log("Error in doctor controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  };

  fetchDoctorSlots = async (
    call: GrpcCall,
    callback: GrpcCallbackk
  ): Promise<void> => {
    try {
      const request: FetchDoctorSlotsRequest = call.request;

      const { email } = call.request;
      console.log("enthappo ivde avastha", email);
      console.log(this.storeAppointmentSlotsService);
      const response =
        await this.storeAppointmentSlotsService.fetchDoctor__Slots(email);
      console.log("Fetched doctor slots:", response);
      callback(null, response);
    } catch (error) {
      console.log("Error in doctor ..........controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  };

  rescheduleAppointment = async (
    call: { request: RescheduleAppointmentRequest },
    callback: (
      error: grpc.ServiceError | null,
      response: RescheduleAppointmentResponse | null
    ) => void
  ) => {
    try {
      const dbResponse =
        await this.storeAppointmentSlotsService.slotReschedule__Appointment(
          call.request
        );
      console.log("check for the final result in CONTROLLER ", dbResponse);
      callback(null, dbResponse);
    } catch (error) {
      console.log("Error in doctor controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      // callback(grpcError, null);
    }
  };

  CancelingAppointMentUserSide = async (
    call: ServerUnaryCall<CancelRequester, CancelResponse>,
    callback: sendUnaryData<CancelResponse>
  ) => {
    try {
      console.log("check here getting the cancelling details", call.request);
      const res =
        await this.storeAppointmentSlotsService.CancelingAppointMent__UserSide(
          call.request as unknown as CancelData
        );

      callback(null, res);
    } catch (error) {
      console.log("Error in notification controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError, null);
    }
  };



  CreatingPrescription = async (
    call: { request: PrescriptionData },
    callback: ( error: grpc.ServiceError | null, response?: PrescriptionResponse) => void
  ) => {
    try {
      const res = await this.storeAppointmentSlotsService.Creating_Prescription(
        call.request
      );
      callback(null, res);
    } catch (error) {
      console.log("Error in notification controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      // callback(grpcError, null);
    }
  };

  fetchingPrescription = async (
    call: { request: FetchPrescriptionRequest },
    callback: ( error: grpc.ServiceError | null, response?: FetchPrescriptionResponse) => void
  ) => {
    try {
      const res =
        await this.storeAppointmentSlotsService.fetching__Prescription(
          call.request
        );
      callback(null, res);
    } catch (error) {
      console.log("Error in prescription controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      // callback(grpcError, null);
    }
  };



doctorCancellingUserAppointment = async (
  call: { request: appointmentaData },
  callback: (error: ServiceError | null, response?: Cancelres) => void
) => {
  try {
    console.log('Data at cancellation time:', call.request);
    const res = await this.storeAppointmentSlotsService.doctorCancelling_UserAppointment(call.request);
    callback(null, res);
  } catch (error) {
    // Convert to a proper gRPC ServiceError
    const grpcError: ServiceError = {
      ...(error instanceof Error ? error : new Error(String(error))),
      code: status.INTERNAL, 
      details: error instanceof Error ? error.message : 'Failed to cancel appointment',
      metadata: new Metadata(),
    };

    // Example: Override for specific errors (e.g., NOT_FOUND)
    if (error instanceof Error && error.message.includes('not found')) {
      grpcError.code = status.NOT_FOUND;
      grpcError.details = 'Appointment not found';
    }

    callback(grpcError);
  }
};


}
