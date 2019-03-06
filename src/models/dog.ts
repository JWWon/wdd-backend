import { NotFound } from 'fejl';
import { Context } from 'koa-respond';
import { Document, model, Schema } from 'mongoose';

export interface Dog extends Document {
  _id: Schema.Types.ObjectId;
  user: string;
  feeds?: string[];
  likes?: string[];
  name: string;
  thumbnail?: string;
  breed: string;
  gender: 'M' | 'F' | 'N';
  birth?: string;
  weight?: number;
  info?: string;
}

const dogSchema = new Schema({
  user: { type: String, index: true, ref: 'User' },
  feeds: [String],
  likes: [String], // emails
  name: { type: String, required: true },
  thumbnail: String,
  breed: { type: String, required: true },
  gender: {
    type: String,
    uppercase: true,
    required: true,
    enum: ['M', 'F', 'N'],
  },
  birth: { type: String, match: /^\d{4}.\d{2}.\d{2}$/ },
  weight: { type: Number, min: 0 },
  info: String,
});

// *** STATIC
dogSchema.statics.createDog = async function(ctx: Context) {
  const { body } = ctx.request;
  NotFound.assert(body.name, '파라미터에 이름이 없습니다');
  NotFound.assert(body.breed, '파라미터에 품종이 없습니다');
  NotFound.assert(body.gender, '파라미터에 성별이 없습니다');
  // add required params automatically
  body.user = ctx.user.email;
  const dog = await this.create(body);
  return dog;
};

export default model<Dog>('Dog', dogSchema);
