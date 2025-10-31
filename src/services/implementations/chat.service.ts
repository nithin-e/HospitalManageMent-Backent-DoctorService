import { IChatService } from '../interfaces/IChat.service';
import {
    AppointmentUpdateParams,
    AppointmentUpdateResponse,
    ChatMessageServiceResponse,
    ChatMessageStorageRequest,
    ConversationFetchRequest,
    ConversationServiceFetchResponse,
} from '../../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/inversify';
import { IChatRepository } from '../../repositories/interfaces/IChat.repository';

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository
    ) {}

    storeMessage = async (
        messageData: ChatMessageStorageRequest
    ): Promise<ChatMessageServiceResponse> => {
        try {
            console.log('Service layer received message data:', messageData);

            const dbResponse = await this._chatRepository.storeMessage(
                messageData
            );

            return {
                success: true,
                message: 'Message stored successfully',
                messageId: dbResponse.messageId,
                conversationId: dbResponse.conversationId,
                doctorId: dbResponse.doctorId,
            };
        } catch (error) {
            console.error('Error in service layer:', error);

            return {
                success: false,
                message: `Service layer error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                messageId: '',
                conversationId: '',
                doctorId: '',
            };
        }
    };

    fetchConversations = async (
        messageData: ConversationFetchRequest
    ): Promise<ConversationServiceFetchResponse> => {
        try {
            const { userId, doctorId } = messageData;

            const dbResponse = await this._chatRepository.fetchConversations(
                userId,
                doctorId
            );

            return {
                success: true,
                conversations: dbResponse.conversations,
                message: 'Conversations fetched successfully',
            };
        } catch (error) {
            console.error('Error in service layer:', error);

            return {
                success: false,
                conversations: [],
                message: `Service layer error: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            };
        }
    };
}
