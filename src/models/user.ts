import { compare, hash } from 'bcrypt';
import { Forbidden, NotAuthenticated } from 'fejl';
import jwt from 'jsonwebtoken';
import { pick } from 'lodash';
import env from '../lib/env';
import { isEmailVaild } from '../lib/validate';
import { Dog } from './dog';
import {
  instanceMethod,
  InstanceType,
  ModelType,
  prop,
  staticMethod,
  Typegoose,
} from 'typegoose';

export interface Serialized
  extends Pick<
    User,
    | 'email'
    | 'status'
    | 'name'
    | 'birth'
    | 'gender'
    | 'lastLogin'
    | 'repDog'
    | 'dogs'
  > {
  token: string;
}

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export class User extends Typegoose {
  @prop({ required: true, unique: true, index: true, validate: isEmailVaild })
  email!: string; // unique
  @prop({ required: true })
  password!: string;
  @prop({ enum: ['ACTIVE', 'PAUSED', 'TERMINATED'], default: 'ACTIVE' })
  status!: 'ACTIVE' | 'PAUSED' | 'TERMINATED';
  @prop({ required: true })
  name!: string;
  @prop({ match: /^\d{4}.\d{2}.\d{2}$/ })
  birth?: string;
  @prop({ uppercase: true, enum: ['M', 'F'] })
  gender?: 'M' | 'F';
  @prop({ default: Date.now })
  lastLogin!: Date;
  @prop({ default: Date.now })
  createdAt!: Date;
  @prop()
  repDog!: InstanceType<Dog>;
  @prop({ default: {} })
  dogs!: { [id: string]: string }; // { _id: name }

  @staticMethod
  static async checkExist(
    this: ModelType<User>,
    { email }: Pick<User, 'email' | 'password' | 'name'>
  ) {
    const user = await this.findOne({ email });
    Forbidden.assert(!user, '이미 존재하는 계정입니다.');
  }

  @instanceMethod
  serialize(this: InstanceType<User>) {
    // generate token
    const serialized: Serialized = {
      ...pick(this, [
        '_id',
        'email',
        'status',
        'name',
        'birth',
        'gender',
        'lastLogin',
        'repDog',
        'dogs',
      ]),
      token: jwt.sign(pick(this, ['_id', 'email']), env.SECRET),
    };
    return serialized;
  }
  @instanceMethod
  async updateLoginStamp(this: InstanceType<User>) {
    this.lastLogin = new Date();
    await this.save();
  }
  @instanceMethod
  async checkPassword(this: InstanceType<User>, password: string) {
    NotAuthenticated.assert(
      await compare(password, this.password),
      '잘못된 비밀번호입니다.'
    );
  }
  // *** Doesn't have callbacks
  @instanceMethod
  async addDog(this: InstanceType<User>, dog: InstanceType<Dog>) {
    this.dogs[dog._id] = dog.name;
    this.repDog = dog;
    this.markModified('dogs');
    this.markModified('repDog');
    await this.save({ validateBeforeSave: true });
  }
  @instanceMethod
  async updateDog(this: InstanceType<User>, dog: InstanceType<Dog>) {
    if (dog.name !== this.dogs[dog._id]) {
      this.dogs[dog._id] = dog.name;
      this.markModified('dogs');
    }
    if (dog._id.equals(this.repDog._id)) {
      this.repDog = dog;
      this.markModified('repDog');
    }
    await this.save({ validateBeforeSave: true });
  }
}

const userModel = new User().getModelForClass(User);

export default userModel;
