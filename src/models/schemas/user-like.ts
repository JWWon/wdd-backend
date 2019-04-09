import { Schema } from 'mongoose';
import { prop, Typegoose } from 'typegoose';

export class UserLike extends Typegoose {
  @prop({ required: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ default: Date.now })
  createdAt!: Date;
}
