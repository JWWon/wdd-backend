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

##### [GET] /places

> request

```javascript
{
  // parse as string(use JSON.stringify())
  location?: { latitude: number, longitude:number };
  keyword?: string;
  range?: number;
}
```

> response

```javascript
{
  ...,
  body: Response[]
}
```
