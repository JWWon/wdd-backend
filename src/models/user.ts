import { Document, model, Schema } from 'mongoose';
import payment, { Payment } from '../lib/schema/payment';
import { isEmailVaild } from '../lib/validate';

// Session Interfaces
interface Local {
  provider: 'LOCAL';
  password: string;
}

interface Google {
  provider: 'GOOGLE';
  idToken: string;
  accessToken: string;
}

interface Kakao {
  provider: 'KAKAO';
  accessToken: string;
}

export interface User extends Document {
  email: string; // unique
  phone: string; // index
  session: Local | Google | Kakao;
  status: 'ACTIVE' | 'SUSPENDED';
  username: string;
  payment: Payment;
  last_ride: Schema.Types.ObjectId;
  last_charge: Schema.Types.ObjectId;
  last_login: Date;
  created_at: Date;
}

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    validate: isEmailVaild,
  },
  phone: {
    type: String,
    index: true,
    required: true,
    match: /^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED'],
    default: 'ACTIVE',
  },
  session: {
    type: Object,
    required: true,
    validate: (value: object) => 'provider' in value,
  },
  username: { type: String, trim: true },
  payments: [payment],
  last_ride: { type: Schema.Types.ObjectId, ref: 'Ride' },
  last_charge: { type: Schema.Types.ObjectId, ref: 'Charge' },
  last_login: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
});

export default model<User>('User', userSchema);
