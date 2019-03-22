import { arrayProp, prop, Typegoose } from 'typegoose';

type longitude = number;
type latitude = number;

// GeoJSON type for search
export class Location extends Typegoose {
  @prop({ required: true, default: 'Point' })
  type!: string;
  @arrayProp({ required: true, items: Number })
  coordinates!: [longitude, latitude];
}
