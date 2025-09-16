import mongoose, { ObjectId, Types } from "mongoose";

// Individual time slot interface
 export interface TimeSlot {
    id?: string;
    start_time: string;
    end_time: string;
    is_available?: boolean;
    appointment_id?: string;
  }
  
  // Time slots for a specific date
  interface DateTimeSlots {
    slots: TimeSlot[];
    date: string;
  }
  
  // Date range options
  type DateRange = 'oneWeek' | 'twoWeeks' | 'oneMonth' | 'custom';
  
  // Action types for slot management
  type SlotAction = 'create' | 'update' | 'delete' | 'bulk_create';
  

  
  // Main appointment data interface
   export interface AppointmentSlotsData {
    selected_dates: string[];
    time_slots: DateTimeSlots[];
    removed_slot_ids: string[];
    remaining_slots: TimeSlot[];
    new_time_slots: TimeSlot[];
    doctor_email: string;
    date_range: DateRange;
    action: SlotAction;
    start_time: string;
    end_time: string;
    slot_duration: number; // in minutes
    include_rest_periods: boolean;
    create_recurring:boolean;
    recurring_months:number;

  }
  

 export interface GrpcCall {
    request: AppointmentSlotsData;
    metadata?: string|number|boolean;
    cancelled?: boolean;
  }

  export interface DbResponse {
    success: boolean;
    message: string;
    slots_created: number;
    dates: string[];
    slots_removed: number;
    slots_updated: number;
  }


  interface GrpcError {
    code: number;
    message: string;
  }
 export interface GrpcCallback {
    (error: GrpcError | null, response: DbResponse | null): void;
  }

  export interface GrpcCallbackk {
    (error:GrpcError | null, response:FetchDoctorSlotsResponse|null):void
  }




  export interface DoctorEmailRequest {
    email: string;
  }
  

  export interface AppointmentSlot {
    id: string; 
    date: string;
    time: string; 
    is_booked: boolean;
    createdAt: Date;
    updatedAt: Date;
    patientEmail?: string; 
  }
  
  export interface FetchDoctorSlotsResponse {
    success: boolean;
    message: string;
    slots_created: number;
    dates: string[]; 
    slots:any 
  }


  export interface Slot {
    id: string;
    date: string;
    time: string;
    is_booked: boolean;
    createdAt: Date;
    updatedAt: Date;
    patientEmail?: string;
}

export interface FetchDoctorSlotsRequest {
    email: string;
}



export interface AppointmentSlotDocument extends mongoose.Document {
    doctorEmail: string;
    date: string;
    time: string;
    isBooked: boolean;
    createdAt: Date;
    updatedAt: Date;
    patientEmail?: string;
    _id: mongoose.Types.ObjectId;
}


// Add these to your existing interfaces file
export interface TimeSlotDetails {
  id: string;
  time: string;        // 24-hour format (e.g., "14:30")
  time12: string;      // 12-hour format (e.g., "2:30 PM")
  time24: string;      // 24-hour format (e.g., "14:30")
  date: string;        // Date in YYYY-MM-DD format
}

export interface RescheduleAppointmentRequest {
  patientEmail: string;
  doctorEmail: string;
  originalSlot: TimeSlotDetails;
  newSlot: TimeSlotDetails;
  action: 'reschedule';
}

export interface RescheduleAppointmentResponse {
  success: boolean;
  message: string;
  data?: {
    updatedAppointment: mongoose.Document;
    originalSlotDeleted: mongoose.Document;
    newSlot: mongoose.Document;
    newSlotTime: string;
  };
  error?: string;
}



// Request Types
export interface FetchAppointmentSlotsRequest {
  email: string;
}

// Response Types
export interface SlotInfo {
  id: string;
  time: string;
  is_booked: boolean;
}

export interface DateSlots {
  date: string;
  slots: SlotInfo[];
}

export interface FetchAppointmentSlotsResponse {
  success: boolean;
  slots_created: number;
  dates: string[];
  time_slots: DateSlots[];
}



// Request Types
export interface AppointmentRequest {
  patientName: string;
  patientEmail?: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  doctorName: string;
  specialty: string;
  userEmail: string;
  userId: string;
  doctorId: string;
}

// Response Types
export interface AppointmentResponse {
  id: string;
  message: string;
}

export interface ControllerAppointmentResponse {
  success: boolean;
  message: string;
  appointment_id: string;
}



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
  status: string;
  message?: string;
  amount?: string;
  adminAmount?: string;
  userRefoundAmount?:string|null;
  doctorAmount?: string;
  paymentStatus?: string;
  payment_method?: string;
  payment_status?: string;
  userId?: string;
  doctorId?: string;
  Prescription?: string;
}


export interface MongoAppointmentt {
  _id?: ObjectId;
  id?: string;
  patientName?: string | null;
  doctorEmail?: string | null;
  patientPhone?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  notes?: string | null;
  doctorName?: string | null;
  specialty?: string | null;
  patientEmail?: string | null;
  status?: string | null;
  message?: string | null;
  userRefoundAmount?: string;
  doctorId?: string | null;
  Prescription?: string | null;
  doctorAmount?:string|null;
  userId?:string|null;
}



export interface MongoAppointment {
  _id: Types.ObjectId;
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
  created_at: Date;
  updated_at: Date;
  message?: string;
  amount?: number;
  adminAmount?: string;
  doctorAmount?: string;
  userRefoundAmount?: string;
  paymentStatus?: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method?: 'online' | 'cash' | 'card';
  payment_status?: 'pending' | 'completed' | 'failed';
  doctorId?: string;
  userId?: string;
  Prescription?: string;
}



// Response Type
export interface UserAppointmentsResponse {
  appointments: Appointment[];
  success: boolean;
  message: string;
  currentPage: number;
  totalPages: number;
  totalAppointments: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Request Type
export interface UserAppointmentsRequest {
  email: string;
  page: number;
  limit: number;
}

// export interface AllAppointmentsResponse {
//   appointments: IAppointment[];
// }



export interface AllAppointmentsResponse {
  appointments: IAppointment[];
  success?: boolean;
  message?: string;
  currentPage?: number;
  totalPages?: number;
  totalAppointments?: number;
  limit?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}


export interface IAppointment {
  id?: Types.ObjectId | string;
  patientName?: string;
  doctorEmail?: string;
  patientPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  doctorName?: string;
  specialty?: string;
  patientEmail?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  created_at?: Date;
  updated_at?: Date;
  message?: string;
  amount?: number;
  adminAmount?: string;
  doctorAmount?: string;
  userRefoundAmount?: string;
  paymentStatus?: 'pending' | 'success' | 'failed' | 'refunded';
  payment_method?: 'online' | 'cash' | 'card';
  payment_status?: 'pending' | 'completed' | 'failed';
  doctorId?: string;
  userId?: string;
  Prescription?: string;
}



export interface CancelAppointmentResponse {
  success: boolean;
  message?: string;
}

export interface CancelAppointmentRequest {
  appointmentId: string | Types.ObjectId;
}


export interface ChatMessageStorageRequest {
  appointmentId: string;
  messageType: 'text' | 'image' | 'file';
  content: string;
  senderType: 'user' | 'doctor' | 'admin';
  timestamp: string;
  senderId: string;
  fileUrl?: string;
  receverId: string;
}

export interface ChatMessageStorageResponse {
  success: boolean;
  message: string;
  messageId: string;
  conversationId: string;
  doctorId: string;
}


export interface ChatMessageDbResponse {
  success: boolean;
  message: string;
  messageId: string;
  conversationId: string;
  doctorId: string;
}


export interface ChatMessageServiceResponse {
  success: boolean;
  message: string;
  messageId: string;
  conversationId: string;
  doctorId: string;
}




export interface ChatMessageGrpcRequest {
  appointmentId: string;
  messageType: 'text' | 'image' | 'file';
  content: string;
  senderType: 'user' | 'doctor' | 'admin';
  timestamp: Date | string;
  senderId: string;
  fileUrl?: string;
  receverId: string;
}

export interface ChatMessageGrpcResponse {
  success: boolean;
  message: string;
  messageId: string;
  conversationId: string;
  doctorId: string;
}

export interface ChatMessageGrpcCall {
  request: ChatMessageGrpcRequest;
}




export type ChatMessageGrpcCallback = (
  error: Error | null,
  response: ChatMessageGrpcResponse | null
) => void;


export interface ConversationFetchRequest {
  userId: string;
  doctorId: string;
}

export interface ConversationMessageDetail {
  messageId: string;
  senderId: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  receiverId: {
    _id: string;
    name?: string;
    email?: string;
  } | string;
  appointmentId: string;
  messageType: 'text' | 'image' | 'file';
  content: string;
  senderType: 'user' | 'doctor' | 'admin';
  fileUrl: string;
  timestamp: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ConversationDetail {
  conversationId: string;
  participants: string[];
  appointmentId: string;
  lastMessage: string;
  lastMessageType: 'text' | 'image' | 'file';
  lastMessageTimestamp: Date | string;
  messages: ConversationMessageDetail[];
}

export interface ConversationDbFetchResponse {
  success: boolean;
  conversations: ConversationDetail[];
}

export interface ConversationServiceFetchResponse {
  success: boolean;
  conversations: ConversationDetail[];
  message: string;
}


export interface ConversationGrpcFetchRequest {
  userId: string;
  doctorId: string;
}

export interface ConversationGrpcFetchResponse {
  success: boolean;
  conversations: ConversationDetail[];
  message: string;
}

export interface ConversationGrpcFetchCall {
  request: ConversationGrpcFetchRequest;
}

export type ConversationGrpcFetchCallback = (
  error: Error | null,
  response: ConversationGrpcFetchResponse | null
) => void;


// types/appointmentTypes.ts

export interface AppointmentUpdateResponse {
  success: boolean;
  error?: string;
  patientEmail?: string;
  appointment?: IAppointment; 
}

export interface AppointmentUpdateParams {
  appointmentId: string;
  endedBy: string;
}


export interface AppointmentUpdateRequest {
  appointmentId: string;
  endedBy: string;
}


export  interface Cancelres{
  success:boolean
}


export interface CreateServiceRequest {
  name:string;
  description:string
}

export interface CreateServiceResponse {
  success:boolean
}

export interface DeleteServiceRequest {
serviceId:string
}

export interface EditServiceRequest {
serviceId:string
name?:string;
description?:string
}

export interface updateData {
serviceId?:string
name?:string;
description?:string
}