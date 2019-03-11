import { Schema } from 'mongoose';
import { arrayProp, prop, Typegoose } from 'typegoose';
import { Report } from './report';

export class Review extends Typegoose {
  @prop({ required: true, index: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true, min: 0, max: 0 })
  rating!: number;
  @prop()
  description?: string;
  @arrayProp({ items: Object })
  reports?: Report[];
}
