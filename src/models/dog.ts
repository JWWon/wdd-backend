import { Schema } from 'mongoose';
import { arrayProp, prop, Typegoose } from 'typegoose';
import { PureInstance } from '../interfaces/model';
import { DogLike } from './schemas/dog-like';

export class Dog extends Typegoose {
  @prop({ index: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true })
  name!: string;
  @prop({ required: true })
  breed!: string;
  @prop({ required: true, uppercase: true, enum: ['M', 'F', 'N'] })
  gender!: 'M' | 'F' | 'N';
  @prop({ default: { firstLike: false } })
  badges!: {
    firstLike: boolean;
  };
  @prop()
  thumbnail?: string;
  @prop({ match: /^\d{4}.\d{2}.\d{2}$/ })
  birth?: string;
  @prop({ min: 0 })
  weight?: number;
  @prop()
  info?: string;
  @arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'Feed', default: [] })
  feeds!: Schema.Types.ObjectId[];
  @arrayProp({ items: Object, default: [] })
  likes!: PureInstance<DogLike>[];
  @arrayProp({ items: Object, default: [] })
  histories!: {
    yearMonth: string;
    count: number;
    seconds: number;
    distance: number;
    steps: number;
    pees: number;
    poos: number;
  }[];
}

const dogModel = new Dog().getModelForClass(Dog);

export default dogModel;
