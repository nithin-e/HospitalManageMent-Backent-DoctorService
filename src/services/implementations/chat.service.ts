import { IChatService } from '../interfaces/IChat.service';
import {
    ChatMessageServiceResponse,
    ChatMessageStorageRequest,
    ConversationFetchRequest,
    ConversationServiceFetchResponse,
} from '../../types/Doctor.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/inversify';
import { IChatRepository } from '../../repositories/interfaces/IChat.repository';
import { CHAT_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class ChatService implements IChatService {
    constructor(
        @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository
    ) {}

    storeMessage = async (
        messageData: ChatMessageStorageRequest
    ): Promise<ChatMessageServiceResponse> => {
        try {
            const dbResponse = await this._chatRepository.storeMessage(
                messageData
            );

            return {
                success: true,
                message: CHAT_MESSAGES.STORE.SUCCESS,
                messageId: dbResponse.messageId,
                conversationId: dbResponse.conversationId,
                doctorId: dbResponse.doctorId,
            };
        } catch (error) {
            console.error(CHAT_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);

            return {
                success: false,
                message: `${CHAT_MESSAGES.ERROR.SERVICE_LAYER_ERROR}: ${
                    error instanceof Error
                        ? error.message
                        : CHAT_MESSAGES.ERROR.UNKNOWN_ERROR
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
                message: CHAT_MESSAGES.FETCH.SUCCESS,
            };
        } catch (error) {
            console.error(CHAT_MESSAGES.ERROR.SERVICE_LAYER_ERROR, error);

            return {
                success: false,
                conversations: [],
                message: `${CHAT_MESSAGES.ERROR.SERVICE_LAYER_ERROR}: ${
                    error instanceof Error
                        ? error.message
                        : CHAT_MESSAGES.ERROR.UNKNOWN_ERROR
                }`,
            };
        }
    };
}
