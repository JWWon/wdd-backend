import { Schema } from 'mongoose';
import { prop, Typegoose } from 'typegoose';

export class Like extends Typegoose {
  @prop({ required: true, ref: 'Dog' })
  dog!: Schema.Types.ObjectId;
  @prop({ default: Date.now })
  createdAt!: Date;
}
