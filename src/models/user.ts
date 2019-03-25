import { compare, hash } from 'bcrypt';
import { Forbidden, NotAuthenticated, NotFound } from 'fejl';
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

type SerializeColumn =
  | 'email'
  | 'status'
  | 'name'
  | 'birth'
  | 'gender'
  | 'lastLogin'
  | 'dogs';

interface DogSummery {
  name: string;
  thumbnail?: string;
  default: boolean;
}

interface Serialized extends Pick<User, SerializeColumn> {
  token: string;
}

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export class User extends Typegoose {
  @prop({ required: true, unique: true, validate: isEmailVaild })
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
  @prop({ default: {} })
  dogs!: { [id: string]: DogSummery };

  @staticMethod
  static async checkExist(
    this: ModelType<User>,
    { email }: Pick<User, 'email' | 'password' | 'name'>
  ) {
    const user = await this.findOne({ email });
    Forbidden.assert(!user, '이미 존재하는 계정입니다.');
  }
  @staticMethod
  static async findByEmail(this: ModelType<User>, email: string) {
    const user = await this.findOne({ email });
    NotFound.assert(user, '존재하지 않는 계정입니다.');
    return user;
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
  @instanceMethod
  async createDog(this: InstanceType<User>, dog: InstanceType<Dog>) {
    const serialized = pick(dog, ['name', 'thumbnail']);
    for (const id in this.dogs) {
      this.dogs[id].default = false;
    }
    this.dogs[dog._id] = Object.assign(serialized, { default: true });
    await this.save({ validateBeforeSave: true });
    return this.serialize();
  }
  @instanceMethod
  async updateDog(this: InstanceType<User>, dog: InstanceType<Dog>) {
    const serialized = pick(dog, ['name', 'thumbnail']);
    this.dogs[dog._id] = Object.assign(this.dogs[dog._id], serialized);
    await this.save({ validateBeforeSave: true });
    return this.serialize();
  }
  @instanceMethod
  async deleteDog(this: InstanceType<User>, id: string) {
    if (this.dogs) {
      delete this.dogs[id];
      const user = await this.save({ validateBeforeSave: true });
      return user.serialize();
    }
  }
}

const userModel = new User().getModelForClass(User);

export default userModel;
