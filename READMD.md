# 오분 backend

코 앞이라 하기엔 애매한 거리. 오분만에 이동하세요!

### Spec

Koa.js + Typescript + MongoDB + Docker

### How To Use

#### development

1. `..$ git clone https://github.com/JWWon/oboon-backend.git`

2. `..$ cd oboon-backend`

3. `../oboon-backend$ npm i`

4. `../oboon-backend$ npm run dev`

#### production

1. `../oboon-backend$ npm run build`

2. `../oboon-backend$ npm start`

### Model

#### User

```json
{
    "_id": ObjectId,
    "status": "Active" | "Suspended",
    "session": Local | Google | Kakao,
    "email": string,
    "username": string,
    "phone": string, // 010-XXXX-XXXX
    "phone_serial": string, // bluetooth
    "payment": [{
        "card": string,
        "provider": string,
        "default": boolean,
    }],
    "last_login": Date,
    "last_ride": ObjectId,
    "last_charge": ObjectId,
    "created_at": Date,
}
```

```javascript
interface Local {
    provider: 'local',
	password: string,
}
    
interface Google {
    provider: 'google',
	idToken: string,
	accessToken: string
}
    
interface Kakao {
	provider: 'kakao',
	accessToken: string
}
```

#### Kickboard

```json
{
    "_id": ObjectId,
    "status": 'RUNNING' | 'WAITING' | 'CHARGING' | 'ERROR',
    "location": {
        "latitude": number,
        "longitude": number,
    },
    "battery": number, // 0 - 100
    "placement": ObjectId,
}
```

#### Ride

```json
{
    "_id": ObjectId,
    "user": ObjectId,
    "kickboard": ObjectId,
    "pinpoints": [{
        "latitude": number,
        "longitude": number,
    }],
    "seconds": number, // riding time
    "distance": number, // km
    "created_at": Date,
}
```

#### Charge

```json
{
    "_id": ObjectId,
    "user": ObjectId,
    "kickboard": ObjectId,
    "battery_level": {
		"before": number, // 0 - 100
		"after": number, // 0 - 100
    },
    "seconds": number, // charging time
    "created_at": Date,
}
```

#### Placement

```json
{
    "_id": ObjectId,
    "name": string, // placement area (ex. 연세대학교, 고려대학교)
    "pinpoints": [{
        "latitude": number,
        "longitude": number,
    }],
    "created_at": Date,
}
```

