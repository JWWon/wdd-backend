import { Schema } from 'mongoose';

export interface Payment {
  provider: string;
  card: string;
  default?: boolean;
}

const payment = new Schema({
  provider: { type: String, required: true },
  card: { type: String, required: true },
  default: Boolean,
});

export default payment;
