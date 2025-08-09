import { IchatHandlingRepo } from '../interFace/chatHandlingRepoInterFace';
import { Types } from 'mongoose';
import Chat from '../../entities/meetSchema';
import Message from '../../entities/messageSchema';
import AppointmentModel from '../../entities/AppointmentModel';
import { AppointmentUpdateResponse, ChatMessageDbResponse, ChatMessageStorageRequest, ConversationDbFetchResponse } from '../../doctorInterFace/IdoctorType';



interface DbResponse {
  success: boolean;
  message: string;
  messageId: any;
  conversationId: string;
  doctorId: string;
}

export default class chatHandlingRepo implements IchatHandlingRepo {

  
  Store_MsngInto__Db = async (messageData: ChatMessageStorageRequest): Promise<ChatMessageDbResponse> => {
    try {
      const {
        appointmentId,
        messageType,
        content,
        senderType,
        timestamp,
        senderId,
        fileUrl,
        receverId
      } = messageData;

      // Convert string IDs to ObjectIds
      const senderObjectId = new Types.ObjectId(senderId);
      const receiverObjectId = new Types.ObjectId(receverId);
      const appointmentObjectId = new Types.ObjectId(appointmentId);

      // Handle chat creation/update first to get chatId
      let chatId: string;
      let existingChat = await Chat.findOne({
        appointmentId: appointmentObjectId,
        participants: { $all: [senderObjectId, receiverObjectId] }
      });

      if (existingChat) {
        // Update existing chat
        existingChat.lastMessage = content;
        existingChat.lastMessageType = messageType;
        existingChat.lastMessageTimestamp = timestamp;
        await existingChat.save();
        chatId = existingChat._id.toString();
        console.log('Chat updated successfully:', existingChat._id);
      } else {
        // Create new chat
        const newChat = new Chat({
          appointmentId: appointmentObjectId,
          participants: [senderObjectId, receiverObjectId],
          lastMessage: content,
          lastMessageType: messageType,
          lastMessageTimestamp: timestamp,
        });
        const savedChat = await newChat.save();
        chatId = savedChat._id.toString();
        console.log('New chat created successfully:', savedChat._id);
      }

      // Create new message with chatId
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

      // Save the message
      const savedMessage = await newMessage.save();
      console.log('Message saved successfully:', savedMessage._id);

      // Determine doctor ID
      const doctorId = senderType === 'doctor' ? senderId : receverId;

      return {
  success: true,
  message: 'Message stored successfully',
  messageId: (savedMessage._id as string).toString(),
  conversationId: chatId,
  doctorId: doctorId
};

    } catch (error) {
      console.error('Error storing message in database:', error);

      return {
        success: false,
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown database error'}`,
        messageId: '',
        conversationId: '',
        doctorId: ''
      };
    }
  };


  fetching_Conversations = async (userId: string, doctorId: string): Promise<ConversationDbFetchResponse> => {
  try {
    const userObjectId = new Types.ObjectId(userId);
    const doctorObjectId = new Types.ObjectId(doctorId);

    const conversations = await Chat.find({
      participants: {
        $all: [userObjectId, doctorObjectId]
      }
    })
    .sort({ lastMessageTimestamp: -1 });

    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await Message.find({
          chatId: conversation._id
        })
        .sort({ timestamp: 1 })
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email')
        .lean();

        return {
          conversationId: conversation._id.toString(),
          participants: conversation.participants.map((p: any) => p.toString()),
          appointmentId: conversation.appointmentId.toString(),
          lastMessage: conversation.lastMessage,
          lastMessageType: conversation.lastMessageType,
          lastMessageTimestamp: conversation.lastMessageTimestamp,
          messages: messages.map(message => ({
            messageId: message._id.toString(),
            senderId: message.senderId._id?.toString() || message.senderId.toString(), 
            receiverId: message.receiverId._id?.toString() || message.receiverId.toString(), 
            appointmentId: message.appointmentId.toString(),
            messageType: message.messageType,
            content: message.content,
            senderType: message.senderType,
            fileUrl: message.fileUrl || '',
            timestamp: message.timestamp,
            createdAt: message.createdAt || new Date(), 
            updatedAt: message.updatedAt || new Date()  
          }))
        };
      })
    );

    return {
      success: true,
      conversations: conversationsWithMessages
    };

  } catch (error) {
    console.error('Error in repository layer:', error);
    throw new Error(`Repository error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}



AfterTheConsultation_Updating_AppointMent = async (
  appointmentId: string,
  endedBy: string
): Promise<AppointmentUpdateResponse> => {
  try {
    // First, fetch the appointment to get the userId
    const appointment = await AppointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return {
        success: false,
        error: 'Appointment not found'
      };
    }

    // Extract userId from the appointment
    const patientEmail = appointment.patientEmail;

    console.log('are u gettting the user id inside the repository', patientEmail);

    // Only update if ended by doctor
    if (endedBy === 'doctor') {
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        appointmentId,
        { 
          status: 'completed',
        },
        { new: true }
      );

      return {
        success: true,
        patientEmail: patientEmail?.toString()||'',
      };
    }

    // If not ended by doctor, still return success with userId
    return {
      success: true,
      patientEmail: patientEmail?.toString() ||''
    };

  } catch (error) {
    console.error('Repository error updating appointment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error occurred'
    };
  }
};

  }
