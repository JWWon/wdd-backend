## Review

### Interfaces

```javascript
interface Review {
  user!: User;
  place!: Schema.Types.ObjectId;
  rating!: number;
  description?: string;
  reports?: Report[];
}

interface Report {
  user!: Schema.Types.ObjectId;
  type!: 'COMMERCIAL' | 'VIOLENT' | 'BULLING' | 'PORNO';
  description?: string;
}
```

### Endpoints

##### [POST] /reviews

> request

`Review [require only strice params]`

> response

```javascript
{
  ...,
  body: Review
}
```

##### [GET] /reviews

> request

```javascript
{
  user?: string;
  place?: string;
}
```

> response

```javascript
{
  ...,
  body: Review[]
}
```

##### [PATCH] /reviews/:id

> request

`Review`

> response

```javascript
{
  ...,
  body: Review
}
```

##### [DELETE] /reviews/:id

> response

```javascript
{
  ...,
  body: { message: string }
}
```
