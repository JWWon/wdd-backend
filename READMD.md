# 오분 backend

코 앞이라 하기엔 애매한 거리. 오분만에 이동하세요!

### Spec

Koa.js + Typescript + MongoDB

### Model

#### User

```json
{
    "_id": ObjectId,
    "session": Local | Google | Kakao,
    "email": string,
    "username": string,
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

