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

```json
Place [only require strict params]
```

> response

```json
{
    ...,
    body: Response
}
```

##### [GET] /places?latitude={{number}}&longitude={{number}}&name={{string}}&range={{number}}

> request

```json
[Options]
// name:  검색 쿼리
// range: 탐색 거리(km)
```

> response

```json
{
    ...,
    body: Response[]
}
```

