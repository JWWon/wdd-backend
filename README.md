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
4. `../wdd-backend$ npm run dev`

### deploy

#### pre

1. Install Docker, Git, Aws-sdk on server
2. `..$ aws configure` (profile: 'default')

#### script (on server)

> _TODO_ Extract mongo from docker-compose & deploy as another instance

1. `..$ git clone https://github.com/JWWon/wdd-backend.git`
2. `..$ npm install`
3. `..$ cd wdd-backend`
4. `../wdd-backend$ chmod +x ./docker-config.sh`
5. `../wdd-backend$ ./docker-config.sh`
6. `docker-compose build`
7. `docker-compose up -d`

### Update (on server)

#### pre

1. `../wdd-backend$ chmod +x ./docker-update.sh`

### script (on server)

1. `../wdd-backend$ ./docker-update.sh`

## API

### authorization

```javascript
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
    email!: string; // unique
    password!: string; // hashed
    status!: 'ACTIVE' | 'PAUSED' | 'TERMINATED';
    name!: string;
    birth?: string;
    gender?: 'M' | 'F';
    lastLogin!: Date;
	createdAt!: Date;
	dogs!: { [id: string]: DogSummery };
	places?: Schema.Types.ObjectId[];
	reviews?: Schema.Types.ObjectId[];
}
```

#### Dog

```javascript
{
    user!: Schema.Types.ObjectId;
    name!: string;
    thumbnail?: string;
	breed!: string;
	gender!: 'M' | 'F' | 'N';
	birth?: string;
    weight?: number;
    info?: string;
	feeds?: Schema.Types.ObjectId[];
	likes?: Schema.Types.ObjectId[];
}
```

#### Feed

```javascript
{
	dog!: Schema.Types.ObjectId;
    user!: Schema.Types.ObjectId;
    seconds!: number;
    distance!: number; // km
    steps!: number;
    pins!: string; // JSON.stringify()
    location!: Location;
}
```

#### Place

```javascript
{
    name!: string;
    location!: ClassInstance<Location>;
    address!: string; // Road Address
    rating!: number;
    officeHour?: OfficeHour;
	contact?: string;
	images!: string[];
	tags?: string[];
	likes?: Schema.Types.ObjectId[];
	reviews?: Schema.Types.ObjectId[];
}
```

#### Review

```javascript
{
	place!: Schema.Types.ObjectId;
	user!: Schema.Types.ObjectId;
	rating!: number;
	description?: string;
	reports?: Report[];
}
```
