import * as grpc from "@grpc/grpc-js";
import {
  AppointmentUpdateParams,
  AppointmentUpdateRequest,
  AppointmentUpdateResponse,
  ChatMessageGrpcCall,
  ChatMessageGrpcCallback,
  ConversationGrpcFetchCall,
  ConversationGrpcFetchCallback,
  ConversationGrpcFetchResponse,
  filteringDoctorAppoinmentsRequest,
  filteringDoctorAppoinmentsResponse,
} from "../../interfaces/Doctor.interface";
import { IChatHandlingService } from "../../service/interFace/IChatHandlingService";
import {
  ChatMessageMapper,
  FilteringDoctorAppointmentsMapper,
} from "../../mapers/chatMessage.mapper";

export default class ChatHandlingController {
  private _chatHandlingServices: IChatHandlingService;

  constructor(chatHandlingServices: IChatHandlingService) {
    this._chatHandlingServices = chatHandlingServices;
  }

  /**
   * Stores a chat message.
   * Maps incoming gRPC request to service request format,
   * calls service to persist the message, then maps the service response
   * back into gRPC response format.
   *
   * @param call - gRPC call containing chat message request
   * @param callback - gRPC callback returning success or error response
   */
  storeMessage = async (
    call: ChatMessageGrpcCall,
    callback: ChatMessageGrpcCallback
  ): Promise<void> => {
    try {
      const messageData = ChatMessageMapper.toStorageRequest(call.request);

      const serviceResponse = await this._chatHandlingServices.storeMessage(
        messageData
      );

      const grpcResponse = ChatMessageMapper.toGrpcResponse(serviceResponse);
      callback(null, grpcResponse);
    } catch (error) {
      console.error("Error in doctor service controller:", error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      };

      // callback(grpcError, null);
    }
  };

  /**
   * Fetches all conversations between a user and a doctor.
   * Retrieves data from service layer and structures it into
   * a gRPC-compatible response object.
   *
   * @param call - gRPC call containing userId and doctorId
   * @param callback - gRPC callback returning conversations or error
   */
  fetchConversations = async (
    call: ConversationGrpcFetchCall,
    callback: ConversationGrpcFetchCallback
  ): Promise<void> => {
    try {
      const { userId, doctorId } = call.request;

      const dbResponse = await this._chatHandlingServices.fetchConversations({
        userId,
        doctorId,
      });

      const response: ConversationGrpcFetchResponse = {
        success: dbResponse.success,
        conversations: dbResponse.conversations || [],
        message: dbResponse.message || "",
      };

      callback(null, response);
    } catch (error) {
      console.error("Error in doctor service controller:", error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      };

      // callback(grpcError, null);
    }
  };

  /**
   * Updates an appointment after consultation ends.
   * Extracts appointmentId and endedBy details from request,
   * then passes them to the service for updating the database.
   *
   * @param call - gRPC call containing appointment update request
   * @param callback - gRPC callback returning update status or error
   */
  updateAppointmentAfterConsultation = async (
    call: grpc.ServerUnaryCall<
      AppointmentUpdateRequest,
      AppointmentUpdateResponse
    >,
    callback: grpc.sendUnaryData<AppointmentUpdateResponse>
  ) => {
    try {
      const params: AppointmentUpdateParams = {
        appointmentId: call.request.appointmentId,
        endedBy: call.request.endedBy,
      };

      const serviceResponse: AppointmentUpdateResponse =
        await this._chatHandlingServices.updateAppointmentAfterConsultation(
          params
        );

      callback(null, serviceResponse);
    } catch (error) {
      console.error("Error in doctor service controller:", error);

      const grpcError = {
        code: grpc.status.INTERNAL,
        message:
          error instanceof Error ? error.message : "Internal server error",
      };

      callback(grpcError, null);
    }
  };

  /**
   * Filters doctor appointments based on given parameters.
   * Uses mapper to convert gRPC request into service params,
   * fetches results from service, and maps them back to gRPC response.
   *
   * @param call - gRPC call containing filtering request
   * @param callback - gRPC callback returning filtered appointments or error
   */
  filteringDoctorAppoinments = async (
    call: grpc.ServerUnaryCall<
      filteringDoctorAppoinmentsRequest,
      filteringDoctorAppoinmentsResponse
    >,
    callback: grpc.sendUnaryData<filteringDoctorAppoinmentsResponse>
  ): Promise<void> => {
    try {
      const params = FilteringDoctorAppointmentsMapper.toServiceParams(
        call.request
      );

      const result =
        await this._chatHandlingServices.filteringDoctorAppoinments(params);

      const grpcResponse =
        FilteringDoctorAppointmentsMapper.toGrpcResponse(result);

      callback(null, grpcResponse);
    } catch (error) {
      console.error("Controller Error - filteringDoctorAppoinments:", error);

      const errorResponse = FilteringDoctorAppointmentsMapper.toGrpcError(
        error instanceof Error ? error.message : "Internal server error"
      );

      callback(null, errorResponse);
    }
  };
}
