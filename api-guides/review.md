## Review

### Interfaces

```javascript
interface Review {
  user!: Schema.Types.ObjectId;
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
