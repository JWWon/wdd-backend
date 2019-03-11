import { arrayProp, index, prop, Typegoose } from 'typegoose';
import { ClassInstance } from '../interfaces/model';
import { Location } from './schemas/location';
import { Review } from './schemas/review';

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
  location!: ClassInstance<Location>;
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
  tags?: string[];
  @arrayProp({ items: String })
  likes?: string[];
  @arrayProp({ items: Object })
  reviews?: ClassInstance<Review>[];
}

const placeModel = new Place().getModelForClass(Place);

export default placeModel;
