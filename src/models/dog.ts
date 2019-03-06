import { NotFound } from 'fejl';
import { Schema } from 'mongoose';
import { Context } from '../interfaces/context';
import { User } from './user';
import {
  arrayProp,
  ModelType,
  prop,
  Ref,
  staticMethod,
  Typegoose,
} from 'typegoose';

export class Dog extends Typegoose {
  @prop({ index: true, ref: 'User' })
  user!: Ref<User>;
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
  static async createDog(
    this: ModelType<Dog>,
    ctx: Context<{
      name: string;
      breed: string;
      gender: 'M' | 'F' | 'N';
      user: string;
    }>
  ) {
    const { body } = ctx.request;
    NotFound.assert(body.name, '파라미터에 이름이 없습니다');
    NotFound.assert(body.breed, '파라미터에 품종이 없습니다');
    NotFound.assert(body.gender, '파라미터에 성별이 없습니다');
    // add required params automatically
    body.user = ctx.user.email;

    const dog = await this.create(body);
    return dog;
  }
}

const dogModel = new Dog().getModelForClass(Dog);

export default dogModel;
