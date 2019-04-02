import { Schema } from 'mongoose';
import { arrayProp, prop, Typegoose } from 'typegoose';

export class Feed extends Typegoose {
  @prop({ required: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true, ref: 'Dog' })
  dog!: Schema.Types.ObjectId;
  @prop({ required: true })
  pins!: string; // JSON.stringify()
  @prop({ required: true, min: 0 })
  seconds!: number;
  @prop({ required: true, min: 0 })
  distance!: number; // km
  @prop({ required: true, min: 0 })
  steps!: number;
  @prop()
  pees!: number;
  @prop()
  poos!: number;
  @prop()
  memo?: string;
  @arrayProp({ items: String })
  images!: string[];
}

const feedModel = new Feed().getModelForClass(Feed);

export default feedModel;
