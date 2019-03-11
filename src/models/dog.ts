import { NotFound } from 'fejl';
import { Schema } from 'mongoose';
import { arrayProp, ModelType, prop, staticMethod, Typegoose } from 'typegoose';
import { hasParams } from '../lib/check-params';

export class Dog extends Typegoose {
  @prop({ index: true, ref: 'User' })
  user!: Schema.Types.ObjectId;
  @prop({ required: true })
  name!: string;
  @prop()
  thumbnail?: string;
  @prop({ required: true })
  breed!: string;
  @prop({ required: true, uppercase: true, enum: ['M', 'F', 'N'] })
  gender!: 'M' | 'F' | 'N';
  @prop({ match: /^\d{4}.\d{2}.\d{2}$/ })
  birth?: string;
  @prop({ min: 0 })
  weight?: number;
  @prop()
  info?: string;
  @arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'Feed' })
  feeds?: Schema.Types.ObjectId[];
  @arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'Dog' })
  likes?: Schema.Types.ObjectId[];

  @staticMethod
  static async findByParams(this: ModelType<Dog>, params: { id: string }) {
    hasParams(['id'], params);
    const dog = await this.findById(params.id);
    NotFound.assert(dog, '댕댕이를 찾을 수 없습니다.');
    return dog;
  }
}

const dogModel = new Dog().getModelForClass(Dog);

export default dogModel;
