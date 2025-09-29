import * as grpc from '@grpc/grpc-js';
import {
    AppointmentUpdateParams,
    AppointmentUpdateRequest,
    AppointmentUpdateResponse,
    ChatMessageGrpcCall,
    ChatMessageGrpcCallback,
    ConversationGrpcFetchCall,
    ConversationGrpcFetchCallback,
    ConversationGrpcFetchResponse,
} from '../types/Doctor.interface';
import { IChatHandlingService } from '../services/interfaces/IChatHandlingService';
import { ChatMessageMapper } from '../mapers/chatMessage.mapper';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';

@injectable()
export default class ChatController {
    constructor(
        @inject(TYPES.AppointmentService)
        private _chatService: IChatHandlingService
    ) {}

    storeMessage = async (
        call: ChatMessageGrpcCall,
        callback: ChatMessageGrpcCallback
    ): Promise<void> => {
        try {
            const messageData = ChatMessageMapper.toStorageRequest(
                call.request
            );

            const serviceResponse = await this._chatService.storeMessage(
                messageData
            );

            const grpcResponse =
                ChatMessageMapper.toGrpcResponse(serviceResponse);
            callback(null, grpcResponse);
        } catch (error) {
            console.error('Error in doctor service controller:', error);

            const grpcError = {
                code: grpc.status.INTERNAL,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            };

            // callback(grpcError, null);
        }
    };

    fetchConversations = async (
        call: ConversationGrpcFetchCall,
        callback: ConversationGrpcFetchCallback
    ): Promise<void> => {
        try {
            const { userId, doctorId } = call.request;

            const dbResponse = await this._chatService.fetchConversations({
                userId,
                doctorId,
            });

            const response: ConversationGrpcFetchResponse = {
                success: dbResponse.success,
                conversations: dbResponse.conversations || [],
                message: dbResponse.message || '',
            };

            callback(null, response);
        } catch (error) {
            console.error('Error in doctor service controller:', error);

            const grpcError = {
                code: grpc.status.INTERNAL,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            };

            // callback(grpcError, null);
        }
    };

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
                await this._chatService.updateAppointmentAfterConsultation(
                    params
                );

            callback(null, serviceResponse);
        } catch (error) {
            console.error('Error in doctor service controller:', error);

            const grpcError = {
                code: grpc.status.INTERNAL,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Internal server error',
            };

            callback(grpcError, null);
        }
    };
}
