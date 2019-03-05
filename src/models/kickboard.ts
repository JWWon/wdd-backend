import { Document, model, Schema } from 'mongoose';
import { genDigits } from '../lib/generator';
import bluetooth, { Bluetooth } from '../lib/schema/bluetooth';
import position, { Position } from '../lib/schema/position';

export interface Kickboard extends Document {
  _id: Schema.Types.ObjectId;
  status: 'RUNNING' | 'WAITING' | 'CHARGING' | 'ERROR';
  number_plate: string;
  position: Position;
  battery: number; // 0 - 100
  bluetooth: Bluetooth;
  placement: Schema.Types.ObjectId;
}

const kickboardSchema = new Schema({
  position,
  bluetooth,
  status: {
    type: String,
    enum: ['RUNNING', 'WAITING', 'CHARGING', 'ERROR'],
    default: 'WAITING',
  },
  number_plate: {
    type: String,
    index: true,
    match: /^\d{4}$/,
    default: genDigits(4),
  },
  battery: { type: Number, min: 0, max: 100 },
  placement: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Placement',
  },
});

export default model<Kickboard>('Kickboard', kickboardSchema);
