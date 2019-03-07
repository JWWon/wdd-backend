import AWS from 'aws-sdk';
import { compare, hash } from 'bcrypt';
import { Forbidden, NotAuthenticated, NotFound } from 'fejl';
import jwt from 'jsonwebtoken';
import { pick } from 'lodash';
import { Schema } from 'mongoose';
import nodemailer from 'nodemailer';
import { Context } from '../interfaces/context';
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

interface DogSummery {
  name: string;
  thumbnail?: string;
  default: boolean;
}

interface PlaceSummery {
  name: string;
  thumbnail: string;
  review?: string;
}

interface Serialized {
  email: string; // unique
  token: string;
  status: 'ACTIVE' | 'PAUSED' | 'TERMINATED';
  name: string;
  birth?: string;
  gender?: 'M' | 'F';
  lastLogin: Date;
  dogs: { [id: string]: DogSummery };
  places: { [id: string]: PlaceSummery };
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
  dogs!: Serialized['dogs'];
  @prop({ default: {} })
  places!: Serialized['places'];

  @staticMethod
  static async signIn(
    this: ModelType<User>,
    ctx: Context<{ email: string; password: string }>
  ) {
    const { body } = ctx.request;
    NotFound.assert(body.email, '파라미터에 이메일이 없습니다.');
    NotFound.assert(body.password, '파라미터에 비밀번호가 없습니다.');
    const user = await this.findOne({ email: body.email });
    if (user) {
      NotAuthenticated.assert(
        await compare(body.password, user.password),
        '잘못된 비밀번호입니다.'
      );
      await user.updateLoginStamp();
      return user.serialize();
    }
  }
  @staticMethod
  static async signUp(
    this: ModelType<User>,
    ctx: Context<{ email: string; password: string; name: string }>
  ) {
    const { body } = ctx.request;
    NotFound.assert(body.email, '파라미터에 이메일이 없습니다.');
    NotFound.assert(body.password, '파라미터에 비밀번호가 없습니다.');
    NotFound.assert(body.name, '파라미터에 이름이 없습니다.');
    const userExist = await this.findOne({ email: body.email });
    Forbidden.assert(!userExist, '이미 존재하는 계정입니다.');
    const hashed = await hash(body.password, 10);
    body.password = hashed;
    const user = await this.create(body);
    // *** lastLogin is not created when first login
    return user.serialize();
  }
  @staticMethod
  static async forgotPassword(
    this: ModelType<User>,
    ctx: Context<{ email: string }>
  ) {
    const { body } = ctx.request;
    NotFound.assert(body.email, '파라미터에 이메일이 없습니다.');
    const user = await this.findOne({ email: body.email });
    if (user) {
      const serialized: Serialized = user.serialize();
      // send email
      const transporter = nodemailer.createTransport({
        SES: new AWS.SES({
          apiVersion: '2012-10-17',
          region: 'us-west-2',
        }),
      });
      await transporter.sendMail({
        from: 'no-reply@woodongdang.com',
        to: user.email,
        subject: '[우리동네댕댕이] 비밀번호 변경을 위해 이메일을 확인해주세요',
        html: `<a href="woodongdang://session/forgot-password/change-password/${
          serialized.token
        }">이메일 인증하기</a>`,
      });
      return serialized;
    }
  }

  @instanceMethod
  serialize(this: InstanceType<User>) {
    // generate token
    const serialized: Serialized = {
      ...pick(this, [
        'email',
        'status',
        'name',
        'birth',
        'gender',
        'lastLogin',
        'dogs',
        'places',
      ]),
      token: jwt.sign(this.email, env.SECRET),
    };
    return serialized;
  }
  @instanceMethod
  async updateLoginStamp(this: InstanceType<User>) {
    this.lastLogin = new Date();
    await this.save();
  }
  @instanceMethod
  async createDog(this: InstanceType<User>, dog: InstanceType<Dog>) {
    const serialized = pick(dog, ['name', 'thumbnail']);
    Object.keys(this.dogs).forEach(id => {
      this.dogs[id].default = false;
    });
    this.dogs[dog._id] = { ...serialized, default: true };
    const user = await this.save();
    return user.serialize();
  }
  @instanceMethod
  async updateDog(this: InstanceType<User>, dog: InstanceType<Dog>) {
    const serialized = pick(dog, ['name', 'thumbnail']);
    this.dogs[dog._id] = { ...this.dogs[dog._id], ...serialized };
    const user = await this.save();
    return user.serialize();
  }
  @instanceMethod
  async selectDog(this: InstanceType<User>, ctx: Context<{ dog_id: string }>) {
    const { body } = ctx.request;
    Object.keys(this.dogs).forEach(id => {
      this.dogs[id] = { ...this.dogs[id], default: body.dog_id === id };
    });
    const user = await this.save();
    return user.serialize();
  }
  @instanceMethod
  async deleteDog(this: InstanceType<User>, id: string) {
    if (this.dogs) {
      delete this.dogs[id];
      const user = await this.save();
      return user.serialize();
    }
  }
}

const userModel = new User().getModelForClass(User);

export default userModel;
