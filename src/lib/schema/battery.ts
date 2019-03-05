import { Schema } from 'mongoose';

export interface Battery {
  before: number;
  after: number;
}

const battery = new Schema({
  before: { type: Number, required: true, min: 0, max: 100 },
  after: { type: Number, min: 0, max: 100 },
});

export default battery;
