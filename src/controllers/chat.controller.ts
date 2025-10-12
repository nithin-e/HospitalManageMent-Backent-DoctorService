import * as grpc from '@grpc/grpc-js';
import {
    AppointmentUpdateParams,
    AppointmentUpdateRequest,
    AppointmentUpdateResponse,
    ChatMessageGrpcCall,
    ChatMessageGrpcCallback,
    ChatMessageGrpcRequest,
    ConversationGrpcFetchCall,
    ConversationGrpcFetchCallback,
    ConversationGrpcFetchResponse,
} from '../types/Doctor.interface';
import { ChatMessageMapper } from '../mapers/chatMessage.mapper';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/inversify';
import { IChatService } from '../services/interfaces/IChat.service';
import { Response, Request } from 'express';

@injectable()
export  class ChatController {
    constructor(
        @inject(TYPES.AppointmentService)
        private _chatService: IChatService
    ) {}

   async storeMessage(req: Request, res: Response): Promise<void> {
        try {
            const messageData = ChatMessageMapper.toStorageRequest(req.body);
            const serviceResponse = await this._chatService.storeMessage(messageData);
            const restResponse = ChatMessageMapper.toGrpcResponse(serviceResponse);

            res.status(200).json({
                success: true,
                data: restResponse,
            });
        } catch (error) {
            console.error("❌ Error in storeMessage (REST):", error);
            res.status(500).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            });
        }
    }

        async storeMessageInDb(messageData: ChatMessageGrpcRequest): Promise<void> {
        try {
            const mappedData = ChatMessageMapper.toStorageRequest(messageData);
            await this._chatService.storeMessage(mappedData);
            console.log("💾 Message stored successfully in DB (from consumer)");
        } catch (error) {
            console.error("❌ Error storing message in DB:", error);
            throw error;
        }
    }

   fetchConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, doctorId } = req.body;

        if (!userId || !doctorId) {
            res.status(400).json({
                success: false,
                message: "Both userId and doctorId are required",
            });
            return;
        }

        const dbResponse = await this._chatService.fetchConversations({
            userId,
            doctorId,
        });

        res.status(200).json({
            success: dbResponse.success,
            conversations: dbResponse.conversations || [],
            message: dbResponse.message || "Conversations fetched successfully",
        });
    } catch (error) {
        console.error("REST fetchConversations error:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Internal server error",
        });
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
