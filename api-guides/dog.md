## Dog

### Interfaces

```javascript
interface Dog {
  user: Schema.Types.ObjectId;
  name: string;
  thumbnail?: string;
  breed: string;
  gender: 'M' | 'F' | 'N';
  birth?: string;
  weight?: number;
  info?: string;
  feeds?: Schema.Types.ObjectId[];
  likes?: Schema.Types.ObjectId[];
}
```

### Endpoints

##### [GET] /dogs, get all user dogs

_authorization required_

> response

```javascript
{
  ...,
  body: Dog[]
}
```

##### [POST] /dogs, create dog

_authorization required_

> request

```
Dog [only require strict params]
```

> response

```javascript
{
  ...,
  body: Dog[]
}
```

##### [GET] /dogs/:id

_authorization required_

> response

```javascript
{
  ...,
  body: Dog[]
}
```

##### [PATCH] /dogs/:id

_authorization required_

> request

```
DOG [only require strict params]
```

> response

```javascript
{
  ...,
  body: Dog[]
}
```

##### [DELETE] /dogs/:id

_authorization required_

> response

```javascript
{
  ...,
  body: { message: 'Dog Terminated' }
}
```
