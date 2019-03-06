import { Document, model, Schema } from 'mongoose';
import position, { Position } from '../lib/schema/position';

export interface Feed extends Document {
  dog: Schema.Types.ObjectId;
  user: string;
  paths: Position[];
  seconds: number;
  distance: number;
  steps: number;
}

const feedSchema = new Schema({
  dog: { type: Schema.Types.ObjectId, required: true },
  user: { type: String, required: true },
  paths: [position],
  seconds: { type: Number, required: true, min: 0 },
  distance: { type: Number, required: true, min: 0 },
  steps: { type: Number, required: true, min: 0 },
});

export default model<Feed>('Placement', feedSchema);
