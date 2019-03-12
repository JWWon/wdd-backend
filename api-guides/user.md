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
    places?: Schema.Types.ObjectId[]
    reviews?: Schema.Types.ObjectId[]
}
```

### Endpoints

##### [POST] /signin

> request

```json
{
    email: string;
    password: string;
}
```

> response

```json
{
    ...,
    body: User
}
```

##### [POST] /signup

> request

```json
{
    email: string;
    password: string;
    name: string
}
```

> response

```json
{
    ...,
    body: User
}
```

##### [POST] /forgot-password

> request

```json
{
    email: string
}
```

> response

```json
{
    ...,
    email: string
}
```

##### [GET] /user

*authorization required*

> response

```json
{
    body: User
}
```

##### [PATCH] /user

*authorization required*

> request

```json
User [just pass update needed params]
```

> response

```json
{
    ...,
    body: User
}
```

##### [PATCH] /user/:dog_id (select default dog)

*authorization required*

> response

```json
{
    ...,
    body: User
}
```

##### [DELETE] /user

*authorization required*

> response

```json
{
    ...,
    message: 'User Terminated'
}
```

