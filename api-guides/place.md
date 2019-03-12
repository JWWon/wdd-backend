## Place

### Interfaces

```javascript
interface Place {
  name: string;
  location: { latitude: number, longitude: number };
  address: string; // Road Address
  rating: number;
  officeHour?: OfficeHour;
  contact?: string;
  images: string[];
  tags?: string[];
  likes?: Schema.Types.ObjectId[];
  reviews?: Schema.Types.ObjectId[];
}

interface Response extends Place {
  distance: number; // km
}
```

### Endpoints

##### [POST] /places

> request

```
Place [only require strict params]
```

> response

```javascript
{
  ...,
  body: Response
}
```

##### [GET] /places?latitude={{number}}&longitude={{number}}&name={{string}}&range={{number}}

> request

```
[Options];
// name:  검색 쿼리
// range: 탐색 거리(km)
```

> response

```javascript
{
  ...,
  body: Response[]
}
```
