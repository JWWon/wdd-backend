import { Schema } from 'mongoose';
import {
  arrayProp,
  instanceMethod,
  InstanceType,
  ModelType,
  prop,
  staticMethod,
  Typegoose,
} from 'typegoose';

interface OfficeHour {
  default: string;
  weekend?: string;
  dayoff?: string;
}

interface Review {}

export class Place extends Typegoose {
  @prop({ required: true })
  name!: string;
  @prop({ required: true })
  address!: string; // Road Address
  @prop({ min: 0, max: 5, default: 0 })
  rating!: number;
  @prop()
  officeHour?: OfficeHour;
  @prop({ match: /^(0\d{1,2}-)?\d{3,4}-\d{4}$/ })
  contact?: string;
  @arrayProp({ items: String })
  images!: string[];
  @arrayProp({ items: String })
  tags!: string[];
  @arrayProp({ items: String })
  likes!: string[];
  @arrayProp({ items: Object })
  reviews!: Review[];
}

const placeModel = new Place().getModelForClass(Place);

export default placeModel;
