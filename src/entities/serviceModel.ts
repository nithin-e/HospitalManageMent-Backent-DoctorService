import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name?: string;
  description?: string;
  createdAt?: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true } // auto adds createdAt, updatedAt
);

export default mongoose.model<IService>("Service", ServiceSchema);
