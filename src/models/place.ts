import { Document, model, Schema } from 'mongoose';

export interface Place extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  images: string[];
  tags: string[];
}

const placeSchema = new Schema({
  ratingAvg: Number,
  reviews: [{ type: String, ref: 'Review' }], // FK, list of Review
  likes: [String], // emails
  name: { type: String, index: true },
  tags: [String],
  address: { type: String, required: true },
  images: [String],
  officeHour: String,
  phone: String,
});

export default model<Place>('Place', placeSchema);
