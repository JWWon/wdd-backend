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

*authorization required*

> response

```json
{
    ...,
    body: Dog[]
}
```

##### [POST] /dogs, create dog

*authorization required*

> request

```json
Dog [only require strict params]
```

> response

```json
{
    ...,
    body: Dog
}
```

##### [GET] /dogs/:id

*authorization required*

> response

```json
{
    ...,
    body: Dog
}
```

##### [PATCH] /dogs/:id

*authorization required*

> request

```json
DOG [only require strict params]
```

> response

```json
{
    ...,
    body: Dog
}
```

##### [DELETE] /dogs/:id

*authorization required*

> response

```json
{
    ...,
    body: { message: 'Dog Terminated' }
}
```

