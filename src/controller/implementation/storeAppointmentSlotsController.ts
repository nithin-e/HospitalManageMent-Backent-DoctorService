import * as grpc from "@grpc/grpc-js";
import { status, Metadata, ServiceError } from "@grpc/grpc-js";
import {
  appointmentaData,
  AppointmentSlotsData,
  CancelData,
  Cancelres,
  CancelResponse,
  DbResponse,
  FetchDoctorSlotsRequest,
  FetchPrescriptionRequest,
  FetchPrescriptionResponse,
  GrpcCallbackk,
  PrescriptionData,
  PrescriptionResponse,
  RescheduleAppointmentRequest,
  RescheduleAppointmentResponse,
} from "../../interfaces/Doctor.interface";
import { IStoreAppointmentSlotsService } from "../../service/interFace/IStoreAppointmentSlots";
import { CancelRequester } from "@grpc/grpc-js/build/src/client-interceptors";

import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

export interface GrpcCall {
  request: FetchDoctorSlotsRequest;
}

export default class StoreAppointmentSlotsController {
  private _storeAppointmentSlotsService: IStoreAppointmentSlotsService;

  constructor(storeAppointmentSlotsService: IStoreAppointmentSlotsService) {
    this._storeAppointmentSlotsService = storeAppointmentSlotsService;
  }

  /**
   * Stores available appointment slots for a doctor.
   *
   * @param call - gRPC call containing appointment slot data
   * @param callback - gRPC response callback
   */
  storeAppointmentSlots = async (
    call: grpc.ServerUnaryCall<AppointmentSlotsData, DbResponse>,
    callback: grpc.sendUnaryData<DbResponse>
  ) => {
    try {
      const dbResponse =
        await this._storeAppointmentSlotsService.createAppointmentSlot(
          call.request
        );

      callback(null, dbResponse);
    } catch (error) {
      console.log("Error in doctor controller:", error);
      callback(
        {
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        },
        null
      );
    }
  };

  /**
   * Fetches all available slots for a doctor.
   *
   * @param call - gRPC call with doctor email
   * @param callback - gRPC response callback
   */
  fetchDoctorSlots = async (
    call: GrpcCall,
    callback: GrpcCallbackk
  ): Promise<void> => {
    try {
      const request: FetchDoctorSlotsRequest = call.request;

      const { email } = call.request;

      const response = await this._storeAppointmentSlotsService.getDoctorSlots(
        email
      );

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

  /**
   * Reschedules an appointment with new date/time.
   *
   * @param call - gRPC call with reschedule request
   * @param callback - gRPC response callback
   */

  rescheduleAppointment = async (
    call: { request: RescheduleAppointmentRequest },
    callback: (
      error: grpc.ServiceError | null,
      response: RescheduleAppointmentResponse | null
    ) => void
  ) => {
    try {
      const dbResponse =
        await this._storeAppointmentSlotsService.rescheduleAppointment(
          call.request
        );

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

  /**
   * Cancels an appointment from the user side.
   *
   * @param call - gRPC call with cancellation data
   * @param callback - gRPC response callback
   */

  cancelAppointmentUserSide = async (
    call: ServerUnaryCall<CancelRequester, CancelResponse>,
    callback: sendUnaryData<CancelResponse>
  ) => {
    try {
      const res =
        await this._storeAppointmentSlotsService.cancelAppointmentByUser(
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

  /**
   * Creates a prescription for an appointment.
   *
   * @param call - gRPC call with prescription data
   * @param callback - gRPC response callback
   */

  CreatingPrescription = async (
    call: { request: PrescriptionData },
    callback: (
      error: grpc.ServiceError | null,
      response?: PrescriptionResponse
    ) => void
  ) => {
    try {
      const res = await this._storeAppointmentSlotsService.createPrescription(
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

  /**
   * Fetches prescription details for an appointment.
   *
   * @param call - gRPC call with prescription request
   * @param callback - gRPC response callback
   */
  fetchPrescription = async (
    call: { request: FetchPrescriptionRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: FetchPrescriptionResponse
    ) => void
  ) => {
    try {
      const res = await this._storeAppointmentSlotsService.getPrescription(
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

  /**
   * Cancels an appointment from the doctor side.
   *
   * @param call - gRPC call with appointment data
   * @param callback - gRPC response callback
   */
  doctorCancelAppointment = async (
    call: { request: appointmentaData },
    callback: (error: ServiceError | null, response?: Cancelres) => void
  ) => {
    try {
      const res =
        await this._storeAppointmentSlotsService.cancelAppointmentByDoctor(
          call.request
        );
      callback(null, res);
    } catch (error) {
      const grpcError: ServiceError = {
        ...(error instanceof Error ? error : new Error(String(error))),
        code: status.INTERNAL,
        details:
          error instanceof Error
            ? error.message
            : "Failed to cancel appointment",
        metadata: new Metadata(),
      };

      if (error instanceof Error && error.message.includes("not found")) {
        grpcError.code = status.NOT_FOUND;
        grpcError.details = "Appointment not found";
      }

      callback(grpcError);
    }
  };
}
