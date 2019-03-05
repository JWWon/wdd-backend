import { Document, model, Schema } from 'mongoose';
import position, { Position } from '../lib/schema/position';

export interface Placement extends Document {
  name: string;
  boundaries: Position[];
  created_at: Date;
}

const placementSchema = new Schema({
  name: { type: String, required: true },
  boundaries: [position],
  created_at: { type: Date, default: Date.now },
});

export default model<Placement>('Placement', placementSchema);
