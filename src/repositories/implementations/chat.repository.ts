import { Types } from 'mongoose';
import Chat from '../../entities/meetSchema';
import Message from '../../entities/messageSchema';
import {
    ChatMessageDbResponse,
    ChatMessageStorageRequest,
    ConversationDbFetchResponse,
} from '../../types/Doctor.interface';
import { injectable } from 'inversify';
import { IChatRepository } from '../interfaces/IChat.repository';
import { CHAT_MESSAGES } from '../../constants/messages.constant';

@injectable()
export class ChatRepository implements IChatRepository {
    storeMessage = async (
        messageData: ChatMessageStorageRequest
    ): Promise<ChatMessageDbResponse> => {
        try {
            const {
                appointmentId,
                messageType,
                content,
                senderType,
                timestamp,
                senderId,
                fileUrl,
                receverId,
            } = messageData;

            const senderObjectId = new Types.ObjectId(senderId);
            const receiverObjectId = new Types.ObjectId(receverId);
            const appointmentObjectId = new Types.ObjectId(appointmentId);

            let chatId: string;
            const existingChat = await Chat.findOne({
                appointmentId: appointmentObjectId,
                participants: { $all: [senderObjectId, receiverObjectId] },
            });

            if (existingChat) {
                existingChat.lastMessage = content;
                existingChat.lastMessageType = messageType;
                existingChat.lastMessageTimestamp = timestamp;
                await existingChat.save();
                chatId = existingChat._id.toString();
            } else {
                const newChat = new Chat({
                    appointmentId: appointmentObjectId,
                    participants: [senderObjectId, receiverObjectId],
                    lastMessage: content,
                    lastMessageType: messageType,
                    lastMessageTimestamp: timestamp,
                });
                const savedChat = await newChat.save();
                chatId = savedChat._id.toString();
            }

            const newMessage = new Message({
                senderId: senderObjectId,
                receiverId: receiverObjectId,
                appointmentId: appointmentObjectId,
                chatId: new Types.ObjectId(chatId),
                messageType: messageType,
                content: content,
                senderType: senderType,
                fileUrl: fileUrl || '',
                timestamp: timestamp,
            });

            const savedMessage = await newMessage.save();

            const doctorId = senderType === 'doctor' ? senderId : receverId;

            return {
                success: true,
                message: CHAT_MESSAGES.STORE.SUCCESS,
                messageId: (savedMessage._id as string).toString(),
                conversationId: chatId,
                doctorId: doctorId,
            };
        } catch (error) {
            console.error(CHAT_MESSAGES.ERROR.STORAGE_FAILED, error);

            return {
                success: false,
                message: `${CHAT_MESSAGES.ERROR.DATABASE_ERROR}: ${
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
        userId: string,
        doctorId: string
    ): Promise<ConversationDbFetchResponse> => {
        try {
            const userObjectId = new Types.ObjectId(userId);
            const doctorObjectId = new Types.ObjectId(doctorId);

            const conversations = await Chat.find({
                participants: {
                    $all: [userObjectId, doctorObjectId],
                },
            }).sort({ lastMessageTimestamp: -1 });

            const conversationsWithMessages = await Promise.all(
                conversations.map(async (conversation) => {
                    const messages = await Message.find({
                        chatId: conversation._id,
                    })
                        .sort({ timestamp: 1 })
                        .populate('senderId', 'name email')
                        .populate('receiverId', 'name email')
                        .lean();

                    return {
                        conversationId: conversation._id.toString(),
                        participants: conversation.participants.map((p: ) =>
                            p.toString()
                        ),
                        appointmentId: conversation.appointmentId.toString(),
                        lastMessage: conversation.lastMessage,
                        lastMessageType: conversation.lastMessageType,
                        lastMessageTimestamp: conversation.lastMessageTimestamp,
                        messages: messages.map((message) => ({
                            messageId: message._id.toString(),
                            senderId:
                                message.senderId._id?.toString() ||
                                message.senderId.toString(),
                            receiverId:
                                message.receiverId._id?.toString() ||
                                message.receiverId.toString(),
                            appointmentId: message.appointmentId.toString(),
                            messageType: message.messageType,
                            content: message.content,
                            senderType: message.senderType,
                            fileUrl: message.fileUrl || '',
                            timestamp: message.timestamp,
                            createdAt: message.createdAt || new Date(),
                            updatedAt: message.updatedAt || new Date(),
                        })),
                    };
                })
            );

            return {
                success: true,
                conversations: conversationsWithMessages,
            };
        } catch (error) {
            console.error(CHAT_MESSAGES.ERROR.REPOSITORY_LAYER_ERROR, error);
            throw new Error(
                `${CHAT_MESSAGES.ERROR.REPOSITORY_LAYER_ERROR}: ${
                    error instanceof Error
                        ? error.message
                        : CHAT_MESSAGES.ERROR.UNKNOWN_ERROR
                }`
            );
        }
    };
}
