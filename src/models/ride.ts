import { Document, model, Schema } from 'mongoose';
import { Position } from '../@types/local';
import { hasProperties } from '../lib/validate';

export interface Ride extends Document {
  _id: Schema.Types.ObjectId;
  user: string;
  kickboard: Schema.Types.ObjectId;
  paths: Position[];
  seconds: number;
  distance: number;
  created_at: Date;
  finished_at: Date;
}

const rideSchema = new Schema({
  user: { type: String, required: true }, // FK
  kickboard: { type: Schema.Types.ObjectId, required: true }, // FK
  paths: [
    {
      type: Object,
      validate: (value: Position) =>
        hasProperties<Position>(value, ['latitude', 'longitude']),
    },
  ],
  seconds: { type: Number, required: true, default: 0 },
  distance: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
  finished_at: Date,
});

export default model<Ride>('Ride', rideSchema);
