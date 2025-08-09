import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  messageType: "text" | "image" | "file";
  content: string;
  senderType: "user" | "doctor" | "admin";
  fileUrl?: string;
  timestamp: string;
  createdAt?: Date;
  updatedAt?: Date;
  chatId?:Types.ObjectId
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  
    chatId:{
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      required: true,
    },
    content: {
      type: String,
      
    },
    senderType: {
      type: String,
      enum: ["user", "doctor", "admin"],
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    timestamp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = model<IMessage>("Message", messageSchema);
export default Message;