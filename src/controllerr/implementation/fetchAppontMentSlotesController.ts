import * as grpc from "@grpc/grpc-js";
import {
  AllAppointmentsResponse,
  AppointmentRequest,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  ControllerAppointmentResponse,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  UserAppointmentsRequest,
  UserAppointmentsResponse,
} from "../../doctorInterFace/IdoctorType";
import { IFetchAppointmentSlotsService } from "../../service/interFace/fetchAppontMentSlotesInterFace";

export default class FetchAppointmentSlotsController 
  
{
  private fetchAppontMentSlotesService: IFetchAppointmentSlotsService;

  constructor(fetchAppontMentSlotesService: IFetchAppointmentSlotsService) {
    this.fetchAppontMentSlotesService = fetchAppontMentSlotesService;
  }

  fetchAppointmentSlots  = async (
    call: { request: FetchAppointmentSlotsRequest },
    callback: ( error: grpc.ServiceError | null, response?: FetchAppointmentSlotsResponse) => void
  ) => {
    try {
      console.log("doctor controller request:", call.request);

      const dbResponse =
        await this.fetchAppontMentSlotesService.fetchAppointmentSlots(
          call.request
        );

      console.log("doctor slots fetched in controller:", dbResponse);

      callback(null, dbResponse);
    } catch (error) {
      console.log("Error in controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      // callback(grpcError);
    }
  };

  makeAppointment  = async (
    call: { request: AppointmentRequest },
    callback: (error: any, response?: ControllerAppointmentResponse) => void
  ) => {
    try {
      console.log("Controller received appointment request:", call.request);

      const dbResponse =
        await this.fetchAppontMentSlotesService.makeAppointment(
          call.request
        );

      console.log("Appointment created in controller:", dbResponse);

      const response: ControllerAppointmentResponse = {
        success: true,
        message: "Appointment booked successfully",
        appointment_id: dbResponse.id,
      };

      callback(null, response);
    } catch (error) {
      console.log("Error in controller:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      callback(grpcError);
    }
  };

  fetchUserAppointments  = async (
    call: { request: UserAppointmentsRequest },
    callback: ( error: grpc.ServiceError | null, response?: UserAppointmentsResponse) => void
  ) => {
    try {
      const { email } = call.request;
      const response =
        await this.fetchAppontMentSlotesService.fetchUserAppointments(email);

      callback(null, {
        appointments: response.appointments,
        success: response.success,
        message: response.message,
      });
    } catch (error) {
      console.log("Error fetching user appointments:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      // callback(grpcError);
    }
  };

  fetchAllUserAppointments  = async (
    call: {},
    callback: (
      error: grpc.ServiceError | null,
      response?: AllAppointmentsResponse
    ) => void
  ) => {
    try {
      const response =
        await this.fetchAppontMentSlotesService.fetchAllUserAppointments();

      console.log("Fetched all appointments:", response);

      const grpcResponse: AllAppointmentsResponse = {
        appointments: response,
      };

      callback(null, grpcResponse);
    } catch (error) {
      console.log("Error fetching user appointments:", error);
    }
  };

  cancelUserAppointment  = async (
    call: { request: CancelAppointmentRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: CancelAppointmentResponse
    ) => void
  ) => {
    try {
      const { appointmentId } = call.request;
      console.log(
        "Received appointment cancellation request for:",
        appointmentId
      );

      const response =
        await this.fetchAppontMentSlotesService.cancelUserAppointment(
          appointmentId
        );

      callback(null, response);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
    }
  };
}
