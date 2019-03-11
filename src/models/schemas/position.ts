import { prop, Typegoose } from 'typegoose';

export class Position extends Typegoose {
  @prop({ required: true })
  latitude!: number;
  @prop({ required: true })
  longitude!: number;
}
