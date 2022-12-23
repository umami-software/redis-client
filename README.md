# @umami/redis-client

Redis client wrapper

# Installation

```
npm install @umami/redis-client
```

# Usage

Declare an environment variable for the connection:

```
REDIS_URL=redis://username:password@hostname:port
```

Example usage:

```javascript
import redisClient from '@umami/redis-client';

await redisClient.set('key', 'hello');

const value = await redisClient.get('key');
```

# License

MIT
