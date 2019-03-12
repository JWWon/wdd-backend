import { Schema } from 'mongoose';
import { prop, Typegoose } from 'typegoose';
import { Location } from './schemas/location';

export class Feed extends Typegoose {
  @prop({ required: true, ref: 'Dog' })
  dog!: Schema.Types.ObjectId;
  @prop({ required: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true, min: 0 })
  seconds!: number;
  @prop({ required: true, min: 0 })
  distance!: number; // km
  @prop({ required: true, min: 0 })
  steps!: number;
  @prop({ required: true })
  pins!: string; // JSON.stringify()
  @prop()
  location!: Location;
}

const feedModel = new Feed().getModelForClass(Feed);

export default feedModel;
