import { Schema } from 'mongoose';
import { prop, Typegoose } from 'typegoose';

export class Report extends Typegoose {
  @prop({ required: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({
    required: true,
    uppercase: true,
    enum: ['COMMERCIAL', 'VIOLENT', 'BULLING', 'PORNO'],
  })
  type!: 'COMMERCIAL' | 'VIOLENT' | 'BULLING' | 'PORNO';
  @prop()
  description?: string;
}
