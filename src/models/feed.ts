import { Schema } from 'mongoose';
import { PureInstance } from '../interfaces/model';
import { Dog } from './dog';
import { UserLike } from './schemas/user-like';
import {
  arrayProp,
  InstanceType,
  prop,
  Typegoose,
  staticMethod,
  ModelType,
} from 'typegoose';

export class Feed extends Typegoose {
  @prop({ required: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true, index: true })
  dog!: InstanceType<Dog>;
  @prop({ required: true, min: 0 })
  seconds!: number;
  @prop({ required: true, min: 0 })
  distance!: number; // km
  @prop({ required: true, min: 0 })
  steps!: number;
  @prop({ required: true })
  pees!: number;
  @prop({ required: true })
  poos!: number;
  @prop({ default: Date.now })
  createdAt!: Date;
  @prop()
  pins!: string;
  @prop()
  memo?: string;
  @arrayProp({ items: String, default: [] })
  images!: string[];
  @arrayProp({ items: Object, default: [] })
  likes!: PureInstance<UserLike>[];

  @staticMethod
  static updateDog(this: ModelType<Feed>, dog: InstanceType<Dog>) {
    this.updateMany(
      { 'dog._id': dog._id },
      { $set: { dog } },
      (err, res) => {}
    );
  }
}

const feedModel = new Feed().getModelForClass(Feed);

export default feedModel;
