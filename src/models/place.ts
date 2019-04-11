import { PureInstance } from '../interfaces/model';
import { Location } from './schemas/location';
import { UserLike } from './schemas/user-like';
import {
  arrayProp,
  index,
  instanceMethod,
  InstanceType,
  prop,
  Typegoose,
} from 'typegoose';

interface OfficeHour {
  default: string;
  weekend?: string;
  dayoff?: string;
}

@index({ location: '2dsphere' })
export class Place extends Typegoose {
  @prop({ required: true })
  name!: string;
  @prop({ required: true })
  location!: PureInstance<Location>;
  @prop({ required: true })
  address!: string; // Road Address
  @prop({ default: '기타' })
  label!: '카페' | '용품' | '병원' | '기타';
  @prop({ min: 0, max: 5, default: 0 })
  rating!: number;
  @prop({ required: true, match: /^0[0-9]{1,2}-[0-9]{3,4}-[0-9]]{4}$/ })
  contact!: string;
  @prop({ required: true })
  thumbnail!: string;
  @prop({ required: true })
  officeHour!: OfficeHour;
  @prop({ index: true })
  query!: string; // disassemble korean for search
  @prop()
  icon?: string;
  @prop()
  description?: string;
  @arrayProp({ items: Object, default: [] })
  scraps!: PureInstance<UserLike>[];
  @arrayProp({ items: String })
  images?: string[];

  @instanceMethod
  serialize(this: InstanceType<Place>) {
    delete this.query;
    return this;
  }
}

const placeModel = new Place().getModelForClass(Place);

export default placeModel;
