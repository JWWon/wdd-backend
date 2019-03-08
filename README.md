# 우리동네댕댕이 Backend

backend project for `우리동네댕댕이` outsource project

> developer - [JWWon](https://github.com/JWWon)

## DEPLOY

1. Install Docker, Git, Aws-sdk on server

2. `git clone https://github.com/JWWon/woodongdang-backend.git`

3. `npm install`

4. `aws configure`, aws account profile is 'default'

5. `chmod +x ./docker-config.sh`

6. `./docker-config.sh`

7. `docker-compose build`

8. `docker-compose up -d`

## API

#### Base

type : JSON (don't stringify)

header

```javascript
{
  authorization: token;
}
```

#### Route

- User

  - `[POST] /signin`
    - params : `{ email: String, password: String }`
    - response : `{ ...UserInstance (password deleted), token: String }`
  - `[POST] /signup`
    - params: `{ email: String, password: String, name: String, birth: YYYY.MM.DD, gender: 'M' | 'F' }`
    - response : `{ ...UserInstance (password deleted), token: String }`
  - `[GET] /user`
    - header required
    - response: `{ ...UserInstance (password deleted), token: String }`
  - `[PATCH] /user`
    - header required
    - params: `{ email: String, password: String, name: String, birth: YYYY.MM.DD, gender: 'M' | 'F' }`
    - response: `{ ...UserInstance (password deleted), token: String }`
  - `[DELETE] /user`
    - header required

- Dog
  - `[GET] /dogs`
    - header required
    - response: `[DogInstance]`
  - `[POST] /dogs`
    - header required
    - params: `{ name: String, thumbnail: String, breed: String, gender: 'M' | 'F', neutered: Boolean, birth: YYYY.MM.DD, weight: Number, info: String }`
    - response: `DogInstance`
  - `[GET] /dogs/:id`
    - header required
    - response: `DogInstance`
  - `[PATCH] /dogs/:id`
    - header required
    - params: `{ name: String, thumbnail: String, breed: String, gender: 'M' | 'F', neutered: Boolean, birth: YYYY.MM.DD, weight: Number, info: String }`
    - response: `DogInstance`
  - `[DELETE] /dogs/:id`
    - header required

## Database

type : `AWS DynamoDB`

control : `dynamoose`

#### Structure

- User

```javascript
{
    email: { type: String, hashKey: true, validate: isEmailVaild },
    password: String, // hashed
    lastLogin: String, // ISO format
    dogs: { type: Object, default: {} }, // { [id: String]: { name: String, thumbnail: String } }
    places: {
      reviews: [String], // FK, list of Review
      pushLikes: [String] // FK, list of Place
    },
    name: { type: String, required: true },
    birth: { type: String, validate: isDateValid },
    gender: {
      type: String,
      uppercase: true,
      validate: isGenderValid
    },
    status: {
      type: String,
      validate: val => ['ACTIVE', 'PAUSED', 'TERMINATED'].includes(val),
      default: 'ACTIVE'
    }
  }
```

- Dog

```javascript
{
  id: {
    type: String,
    hashKey: true
  },
  user: {
    // FK, User
    type: String,
    rangeKey: true,
    index: true
  },
  feeds: [String],
  getLikes: [String], // FK, Dog
  name: { type: String, required: true },
  thumbnail: String,
  breed: { type: String, required: true },
  gender: {
    type: String,
    uppercase: true,
    required: true,
    validate: isGenderValid
  },
  neutered: { type: Boolean, default: false },
  birth: { type: String, validate: isDateValid },
  weight: { type: Number, validate: val => val > 0 },
  info: String // 특이사항
}
```

- Walk

> Created when start walking, Deleted after finish walking

```javascript
{
	id: string, // PK
	createdAt: Date,
	updatedAt: Date,
	dog: string, // FK
	/* update every 10 secs */
	pin: {
        lat: number, // float
        lng: number, // float
	}
}
```

- Feed

> Created via get data from `Walk` table

```javascript
{
	id: string, // PK
	createdAt: Date,
	dog: string, // FK
	/* strict */
	time: string, // 00:00:00(hh:mm:ss)
	distance: number, // km
	peeCount: number,
	pooCount: number,
	pins: [{
		/* interval 10 secs */
		lat: number, // float
		lng: number, // float
		type: null | 'pee' | 'poo'
	}],
	/* option */
	image?: string, // background image
}
```

- Place

```javascript
{
	id: string, // PK
	ratingAvg: number, // float
	reviews: string[], // FK
	getLikes: string[], // FK, list of User
	pin: {
		lat: number,
		lng: number,
	},
	/* strict */
	name: string,
	tag: string,
	address: string,
	images: string[],
	officeHour: string, // free form
	phone: string, // 010-0000-0000
}
```

- Review

```javascript
{
    id: string, // PK
	createdAt: Date,
	updatedAt: Date,
	place: string, // FK
	user: string, // FK
	/* strict */
	rating: number,
	images: string[],
	comment: string,
	reports: ('useBadWord' | 'advertising' | 'duplicated')[],
}
```
