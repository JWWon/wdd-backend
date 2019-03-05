import { Schema } from 'mongoose';

export interface Bluetooth {
  identifier: string;
  uuid: string;
}

const bluetooth = new Schema({
  identifier: { type: String, required: true },
  uuid: { type: String, required: true },
});

export default bluetooth;
