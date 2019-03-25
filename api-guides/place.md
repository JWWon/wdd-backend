## Place

### Interfaces

```javascript
interface Place {
  name!: string;
  location!: LatLng;
  address!: string; // Road Address
  label!: '카페' | '용품' | '병원' | '기타';
  rating!: number;
  contact!: string;
  thumbnail?: string;
  officeHour?: OfficeHour;
  images!: string[];
  likes!: Schema.Types.ObjectId[];
}

interface PlaceWithDist extends Place {
  distance: number; // km
}
```

### Endpoints

##### [POST] /places

> request

`Place [require only strict params]`

> response

```javascript
{
  ...,
  body: Place
}
```

##### [GET] /places

> request

```javascript
{
  // parse as string(use JSON.stringify())
  label?: '카페' | '용품' | '병원' | '기타';
  keyword?: string;
  location?: { latitude: number, longitude: number };
  range?: number; // unit: Km
}
```

> response

```javascript
{
  ...,
  body: Place[] | PlaceWithDist[]
}
```

##### [PATCH] /places/:id

> request

`Place [require only strict params]`

> response

```javascript
{
  ...,
  body: Place
}
```

##### [DELETE] /places/:id

> response

```javascript
{
  ...,
  body: { message: string }
}
```

##### [GET] /places/:id/likes

> 좋아요 누른 가게 목록 불러오기

_authorization required_

> response

```javascript
{
  ...,
  body: Place[]
}
```

##### [POST] /places/:id/likes

> 좋아요

_authorization required_

> response

```javascript
{
  ...,
  body: Place[]
}
```

##### [DELETE] /places/:id/likes

> 좋아요 취소

_authorization required_

> response

```javascript
{
  ...,
  body: Place[]
}
```
