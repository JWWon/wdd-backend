import { Document, model, Schema } from 'mongoose';
import battery, { Battery } from '../lib/schema/battery';
import position, { Position } from '../lib/schema/position';

export interface Charge extends Document {
  _id: Schema.Types.ObjectId;
  user: string;
  kickboard: Schema.Types.ObjectId;
  position: Position;
  battery: Battery;
  seconds: number;
  created_at: Date;
  finished_at: Date;
}

const chargeSchema = new Schema({
  position,
  battery,
  user: { type: String, required: true, ref: 'User' }, // FK
  kickboard: { type: Schema.Types.ObjectId, required: true, ref: 'Kickboard' }, // FK
  seconds: { type: Number, min: 0, default: 0 },
  created_at: { type: Date, default: Date.now },
  finished_at: Date,
});

export default model<Charge>('Charge', chargeSchema);
