import { model, Schema, Types } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[];
  appointmentId: Types.ObjectId;
  lastMessageType: "text" | "image" | "file";
  lastMessage: string;
  lastMessageTimestamp: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
      },
    ],
    appointmentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    lastMessageType: {
      type: String,
      enum: ["text", "image", "file"],
      required: true,
    },
    lastMessage: {
      type: String,
     
    },
    lastMessageTimestamp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Chat = model<IChat>("Chat", chatSchema);
export default Chat;