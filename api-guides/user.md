## User

### Interfaces

```javascript
interface DogSummery {
  name: string;
  thumbnail?: string;
  default: boolean;
}

interface User {
  _id: Schema.Types.ObjectId;
  email: string;
  status: 'ACTIVE' | 'PAUSED' | 'TERMINATED';
  name: string;
  birth?: string; // YYYY.MM.DD
  gender?: 'M' | 'F'
  lastLogin: Date
  dogs: { [id: Schema.Types.ObjectId]: DogSummery }
  places: { _id: Schema.Types.ObjectId, type: 'LIKE' | 'REVIEW' }[]
}
```

### Endpoints

##### [POST] /signin

> request

```javascript
{
  email: string;
  password: string;
}
```

> response

```javascript
{
  ...,
  body: User
}
```

##### [POST] /signup

> request

```javascript
{
  email: string;
  password: string;
  name: string;
}
```

> response

```javascript
{
  ...,
  body: User
}
```

##### [POST] /forgot-password

> request

```javascript
{
  email: string;
}
```

> response

```javascript
{
  ...,
  email: string
}
```

##### [GET] /user

_authorization required_

> response

```javascript
{
  body: User;
}
```

##### [PATCH] /user

_authorization required_

> request

```
User [just pass update needed params]
```

> response

```javascript
{
  ...,
  body: User
}
```

##### [PATCH] /user/:dog_id (select default dog)

_authorization required_

> response

```javascript
{
  ...,
  body: User
}
```

##### [DELETE] /user

_authorization required_

> response

```javascript
{
  ...,
  message: 'User Terminated'
}
```
