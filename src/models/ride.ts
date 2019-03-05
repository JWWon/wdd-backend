import { Document, model, Schema } from 'mongoose';
import position, { Position } from '../lib/schema/position';

export interface Ride extends Document {
  _id: Schema.Types.ObjectId;
  user: string;
  kickboard: Schema.Types.ObjectId;
  pinpoints: Position[];
  seconds: number;
  distance: number;
  created_at: Date;
  finished_at: Date;
}

const rideSchema = new Schema({
  user: { type: String, required: true, ref: 'User' }, // FK
  kickboard: { type: Schema.Types.ObjectId, required: true, ref: 'Kickboard' }, // FK
  pinpoints: [position],
  seconds: { type: Number, min: 0, default: 0 },
  distance: { type: Number, min: 0, default: 0 },
  created_at: { type: Date, default: Date.now },
  finished_at: Date,
});

export default model<Ride>('Ride', rideSchema);
