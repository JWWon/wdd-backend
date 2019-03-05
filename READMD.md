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
    "status": "ACTIVE" | "SUSPENDED",
    "session": Local | Google | Kakao,
    "email": string, // unique
    "username": string,
    "phone": string, // 010-XXXX-XXXX, index
    "payment": [{
        "card": string,
        "provider": string,
        "default": boolean,
    }],
    "last_ride": ObjectId,
    "last_charge": ObjectId,
    "last_login": Date,
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
	accessToken: string,
}
    
interface Kakao {
	provider: 'kakao',
	accessToken: string,
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
    "bluetooth": {
        "identifier": string,
        "uuid": string,
    },
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

### How It Works

1. 지도에서 킥보드를 검색
2. 킥보드 주변으로 이동 & 킥보드 대여 클릭
3. 1분 내에 킥보드를 블루투스로 감지시 대여 시작
4. 대여 종료 후 요금 결제