import { Schema } from 'mongoose';

export interface Position {
  latitude: number;
  longitude: number;
}

const position = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

export default position;
