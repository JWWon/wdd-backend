import { Document, model, Schema } from 'mongoose';
import { Position } from '../@types/local';
import { hasProperties } from '../lib/validate';

interface Bluetooth {
  identifier: string;
  uuid: string;
}

export interface Kickboard extends Document {
  _id: Schema.Types.ObjectId;
  status: 'RUNNING' | 'WAITING' | 'CHARGING' | 'ERROR';
  position: Position;
  battery: number; // 0 - 100
  bluetooth: Bluetooth;
  placement: Schema.Types.ObjectId;
}

const kickboardSchema = new Schema({
  status: {
    type: String,
    enum: ['RUNNING', 'WAITING', 'CHARGING', 'ERROR'],
    default: 'WAITING',
  },
  position: {
    type: Object,
    validate: (value: Position) =>
      hasProperties<Position>(value, ['latitude', 'longitude']),
  },
  battery: { type: Number, min: 0, max: 100 },
  bluetooth: {
    type: Object,
    required: true,
    validate: (value: Bluetooth) =>
      hasProperties<Bluetooth>(value, ['identifier', 'uuid']),
  },
  placement: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Placement',
  },
});

export default model<Kickboard>('Kickboard', kickboardSchema);
