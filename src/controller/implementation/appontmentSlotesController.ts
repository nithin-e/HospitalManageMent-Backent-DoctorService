import * as grpc from "@grpc/grpc-js";
import {
  AllAppointmentsResponse,
  AppointmentRequest,
  CancelAppointmentRequest,
  CancelAppointmentResponse,
  ControllerAppointmentResponse,
  CreateServiceRequest,
  CreateServiceResponse,
  DeleteServiceRequest,
  EditServiceRequest,
  FetchAppointmentSlotsRequest,
  FetchAppointmentSlotsResponse,
  FetchServiceRequest,
  FetchServiceResponse,
  UserAppointmentsRequest,
  UserAppointmentsResponse,
} from "../../interfaces/Doctor.interface";
import { IFetchAppointmentSlotsService } from "../../service/interFace/IFetchAppontMentSlotes";

export default class FetchAppointmentSlotsController {
  private _fetchAppontMentSlotesService: IFetchAppointmentSlotsService;

  constructor(fetchAppontMentSlotesService: IFetchAppointmentSlotsService) {
    this._fetchAppontMentSlotesService = fetchAppontMentSlotesService;
  }

  fetchAppointmentSlots = async (
    call: { request: FetchAppointmentSlotsRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: FetchAppointmentSlotsResponse
    ) => void
  ) => {
    try {
      console.log("doctor controller request:", call.request);

      const dbResponse =
        await this._fetchAppontMentSlotesService.fetchAppointmentSlots(
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

  makeAppointment = async (
    call: { request: AppointmentRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: ControllerAppointmentResponse
    ) => void
  ) => {
    try {
      console.log("Controller received appointment request:", call.request);

      const dbResponse =
        await this._fetchAppontMentSlotesService.makeAppointment(call.request);

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
      // callback(null,grpcError);
    }
  };

  fetchUserAppointments = async (
    call: { request: UserAppointmentsRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: UserAppointmentsResponse
    ) => void
  ) => {
    try {
      const { email, page = 1, limit = 3 } = call.request;

      // Validate pagination parameters
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 100);

      const response =
        await this._fetchAppontMentSlotesService.fetchUserAppointments(
          email,
          validatedPage,
          validatedLimit
        );

      console.log("machuveeeee check this", response);

      callback(null, {
        appointments: response.appointments,
        success: response.success,
        message: response.message,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalAppointments: response.totalAppointments,
        limit: response.limit,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
      });
    } catch (error) {
      console.log("Error fetching user appointments:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
      // callback(grpcError,null);
    }
  };

  //
  fetchAllUserAppointments = async (
    call: { request: { page: number; limit: number } },
    callback: (
      error: grpc.ServiceError | null,
      response?: AllAppointmentsResponse
    ) => void
  ) => {
    try {
      const { page, limit } = call.request;

      const response =
        await this._fetchAppontMentSlotesService.fetchAllUserAppointments(
          page,
          limit
        );

      console.log("Fetched all appointments with pagination:", response);

      const grpcResponse: AllAppointmentsResponse = {
        appointments: response.appointments,
        success: true,
        message: "Appointments fetched successfully",
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalAppointments: response.totalAppointments,
        limit: response.limit,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
      };

      callback(null, grpcResponse);
    } catch (error) {
      console.log("Error fetching user appointments:", error);
    }
  };

  cancelUserAppointment = async (
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
        await this._fetchAppontMentSlotesService.cancelUserAppointment(
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

  createService = async (
    call: { request: CreateServiceRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: CreateServiceResponse
    ) => void
  ) => {
    try {
      const { name, description } = call.request;

      // call repository
      const success = await this._fetchAppontMentSlotesService.createService(
        name,
        description
      );

      // wrap into CreateServiceResponse
      const response: CreateServiceResponse = { success };

      callback(null, response);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
    }
  };

  fetchService = async (
    call: grpc.ServerUnaryCall<FetchServiceRequest, FetchServiceResponse>,
    callback: grpc.sendUnaryData<FetchServiceResponse>
  ) => {
    try {
      const services = await this._fetchAppontMentSlotesService.fetchService();

      const response: FetchServiceResponse = {
        services: services,
        success: true,
        message: "Services fetched successfully",
      };

      // Send successful response
      callback(null, response);
    } catch (error) {
      console.error("Error fetching services:", error);

      // Create gRPC error
      const grpcError = {
        name: "ServiceError",
        message: (error as Error).message || "Failed to fetch services",
        code: grpc.status.INTERNAL,
        details: "Internal server error while fetching services",
      };

      // Send error response
      // callback(grpcError, null);
    }
  };

  deleteService = async (
    call: { request: DeleteServiceRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: CreateServiceResponse
    ) => void
  ) => {
    try {
      const { serviceId } = call.request;

      const result = await this._fetchAppontMentSlotesService.deleteService(
        serviceId
      );

      const response: CreateServiceResponse = {
        success: result,
      };

      callback(null, response);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      const grpcError = {
        code: grpc.status.INTERNAL,
        message: (error as Error).message,
      };
    }
  };

  editService = async (
    call: { request: EditServiceRequest },
    callback: (
      error: grpc.ServiceError | null,
      response?: CreateServiceResponse
    ) => void
  ) => {
    try {
      const { serviceId, name, description } = call.request;

      const result = await this._fetchAppontMentSlotesService.editService(
        serviceId,
        name,
        description
      );

      const response: CreateServiceResponse = {
        success: result,
      };

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
