# 우리동네댕댕이 Backend

backend project for `우리동네댕댕이` outsource project

> developer - [JWWon](https://github.com/JWWon)

## Spec

Koa.js + Typescript + MongoDB + Docker

## How To Use

### install on local

#### pre

1. Install Docker, MongoDB image
2. `..$ docker run -d mongo --port 27017:27017`

#### script (on local)

1. `..$ git clone https://github.com/JWWon/wdd-backend.git`
2. `..$ cd wdd-backend`
3. `../wdd-backend$ npm install`
4. `../wdd-backend$  npm run dev`

### deploy

#### pre

1. Install Docker, Git, Aws-sdk on server
2. `..$ aws configure` (profile: 'default')

#### script (on server)

> *TODO*  Extract mongo from docker-compose & deploy as another instance

1. `..$ git clone https://github.com/JWWon/wdd-backend.git`
2. `..$ npm install`
3. `..$ cd wdd-backend`
4. `../wdd-backend$ chmod +x ./docker-config.sh`
5. `../wdd-backend$ ./docker-config.sh`
6. `docker-compose build`
7. `docker-compose up -d`

## API

### authorization

```json
{
    ...,
    headers: {
    	authorization: /* USER_TOKEN */
	}
}
```

### [User](./api-guides/user.md)

### [Dog](./api-guides/dog.md)

### [Feed](./api-guides/feed.md)

### [Place](./api-guides/place.md)

### [Review](./api-guides/review.md)

## Model

ORM : `typegoose`

#### User

```javascript
{
    @prop({ required: true, unique: true, validate: isEmailVaild })
    email!: string; // unique
    @prop({ required: true })
    password!: string; // hashed
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
	@arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'Place' })
	places?: Schema.Types.ObjectId[];
	@arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'Review' })
	reviews?: Schema.Types.ObjectId[];
}
```

#### Dog 

```javascript
{
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
}
```

#### Feed

```javascript
{
	@prop({ required: true, ref: 'Dog' })
	dog!: Schema.Types.ObjectId;
    @prop({ required: true, ref: 'User' })
    user!: Schema.Types.ObjectId;
    @prop({ required: true, min: 0 })
    seconds!: number;
    @prop({ required: true, min: 0 })
    distance!: number; // km
    @prop({ required: true, min: 0 })
    steps!: number;
    @prop({ required: true })
    pins!: string; // JSON.stringify()
    @prop()
    location!: Location;
}
```

#### Place

```javascript
{
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
	@arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'User' })
	likes?: Schema.Types.ObjectId[];
	@arrayProp({ items: Schema.Types.ObjectId, itemsRef: 'Review' })
	reviews?: Schema.Types.ObjectId[];
}
```

#### Review

```javascript
{
	@prop({ required: true, index: true, ref: 'Place' })
	place!: Schema.Types.ObjectId;
	@prop({ required: true, index: true, ref: 'User' })
	user!: Schema.Types.ObjectId;
	@prop({ required: true, min: 0, max: 0 })
	rating!: number;
	@prop()
	description?: string;
	@arrayProp({ items: Object })
	reports?: Report[];
}
```
