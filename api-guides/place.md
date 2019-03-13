## Place

### Interfaces

```javascript
interface Place {
  name: string;
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
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

##### [GET] /places?coordinates=[{{number}},{{number}}]&name={{string}}&range={{number}}

> request

```
[Options]
// coordinates : 기준 좌표
// name        : 검색 쿼리
// range       : 탐색 거리(km)
```

> response

```javascript
{
  ...,
  body: Response[]
}
```
