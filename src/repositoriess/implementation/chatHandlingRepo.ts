import { IChatHandlingRepo } from '../interFace/chatHandlingRepoInterFace';
import { FilterQuery, SortOrder, Types } from 'mongoose';
import Chat from '../../entities/meetSchema';
import Message from '../../entities/messageSchema';
import AppointmentModel from '../../entities/AppointmentModel';
import { AppointmentUpdateResponse, ChatMessageDbResponse, ChatMessageStorageRequest, ConversationDbFetchResponse } from '../../doctorInterFace/IdoctorType';

export interface Appointment {
  id: string;
  patientName: string;
  doctorEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  doctorName: string;
  specialty: string;
  patientEmail: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  message: string;
  payment_method: 'online' | 'cash' | 'card';
  paymentStatus: 'pending' | 'success' | 'failed' | 'refunded';
  amount: string;
  doctorAmount: string;
  adminAmount: string;
  userRefoundAmount: string;
  userId: string;
  doctorId: string;
  Prescription: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchParamss {
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  role: string; 
  page: number;
  limit: number;
}


export interface FilteringResponse {
  appointments: Appointment[];
  success: boolean;
  message: string;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export default class ChatHandlingRepo  implements IChatHandlingRepo {

  
  storeMessage = async (messageData: ChatMessageStorageRequest): Promise<ChatMessageDbResponse> => {
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


  fetchConversations = async (userId: string, doctorId: string): Promise<ConversationDbFetchResponse> => {
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



updateAppointmentAfterConsultation = async (
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


async filteringDoctorAppoinments(params: SearchParamss): Promise<FilteringResponse> {
    try {
      const {
        searchQuery = '',
        sortBy = 'createdAt',
        sortDirection = 'desc',
        page = 1,
        limit = 50,
        role = ''
      } = params;

      // Build search filter
      const filter: FilterQuery<any> = {};
      
      // Add text search filter
      if (searchQuery && searchQuery.trim()) {
        const searchRegex = { $regex: searchQuery.trim(), $options: 'i' };
        filter.$or = [
          { patientName: searchRegex },
          { doctorName: searchRegex },
          { patientEmail: searchRegex },
          { doctorEmail: searchRegex },
          { specialty: searchRegex },
          { patientPhone: searchRegex }
        ];
      }

      // Add role-based filtering
      if (role && role.trim()) {
        const roleValue = role.trim().toLowerCase();
        if (roleValue === 'doctor') {
          filter.doctorEmail = { $exists: true, $ne: null };
        } else if (roleValue === 'patient') {
          filter.patientEmail = { $exists: true, $ne: null };
        }
      }

      // Build sort object with validation
      const validSortFields = [
        'created_at', 
        'updated_at', 
        'appointmentDate', 
        'patientName', 
        'doctorName',
        'createdAt',  
        'updatedAt'
      ];
      let sortField = sortBy;
      
      // Map interface field names to MongoDB field names
      if (sortBy === 'createdAt') sortField = 'created_at';
      if (sortBy === 'updatedAt') sortField = 'updated_at';
      
      // Validate the field exists
      if (!validSortFields.includes(sortField)) {
        sortField = 'created_at';
      }
      
      const sort: { [key: string]: SortOrder } = {};
      sort[sortField] = sortDirection === 'asc' ? 1 : -1;

      // Calculate pagination with validation
      const validatedPage = Math.max(1, page);
      const validatedLimit = Math.min(Math.max(1, limit), 100);
      const skip = (validatedPage - 1) * validatedLimit;

      // Execute query with error handling
      const [appointmentsRaw, totalCount] = await Promise.all([
        AppointmentModel.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(validatedLimit)
          .lean()
          .exec(),
        AppointmentModel.countDocuments(filter).exec()
      ]);

      // Transform MongoDB documents to match Appointment interface
      const appointments: Appointment[] = appointmentsRaw.map(doc => ({
        id: doc._id?.toString() || '',
        patientName: doc.patientName || '',
        doctorEmail: doc.doctorEmail || '',
        patientPhone: doc.patientPhone || '',
        appointmentDate: doc.appointmentDate || '',
        appointmentTime: doc.appointmentTime || '',
        notes: doc.notes || '',
        doctorName: doc.doctorName || '',
        specialty: doc.specialty || '',
        patientEmail: doc.patientEmail || '',
        status: doc.status || 'scheduled',
        message: doc.message || '',
        payment_method: doc.payment_method || 'cash',
        paymentStatus: doc.paymentStatus || 'pending',
        amount: doc.amount?.toString() || '0',
        doctorAmount: doc.doctorAmount || '0',
        adminAmount: doc.adminAmount || '0',
        userRefoundAmount: doc.userRefoundAmount || '0',
        userId: doc.userId || '',
        doctorId: doc.doctorId || '',
        Prescription: doc.Prescription || '',
        createdAt: doc.created_at ||new Date(),
        updatedAt: doc.updated_at ||  new Date()
      }));

      const totalPages = Math.ceil(totalCount / validatedLimit);

      return {
        appointments,
        success: true,
        message: 'Appointments fetched successfully',
        totalCount,
        totalPages,
        currentPage: validatedPage
      };

    } catch (error) {
      console.error('Repository Error - filtering appointments:', error);
      
      // Return error response instead of throwing
      return {
        appointments: [],
        success: false,
        message: error instanceof Error ? error.message : 'Failed to filter appointments',
        totalCount: 0,
        totalPages: 0,
        currentPage: params.page || 1
      };
    }
  }


  }
