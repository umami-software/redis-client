# @umami/redis-client

Redis client wrapper

# Installation

```
pnpm add @umami/redis-client
```

# Usage

```javascript
import { UmamiRedisClient } from '@umami/redis-client';

const redis = new UmamiRedisClient({ url: process.env.REDIS_URL });

await redis.set('key', 'hello');
```


# License

MIT
