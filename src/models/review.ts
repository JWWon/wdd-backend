import { Schema } from 'mongoose';
import { arrayProp, prop, Typegoose } from 'typegoose';
import { Report } from './schemas/report';

export class Review extends Typegoose {
  @prop({ required: true, index: true, ref: 'Place' })
  place!: Schema.Types.ObjectId;
  @prop({ required: true, index: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true, min: 0, max: 0 })
  rating!: number;
  @prop()
  description?: string;
  @arrayProp({ items: Object })
  reports?: Report[];
}

const reviewModel = new Review().getModelForClass(Review);

export default reviewModel;
