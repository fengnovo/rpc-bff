const LRUCache = require('lru-cache');
const Redis = require('ioredis');

class CacheStore {
    constructor() {
        this.stores = [];
    }
    add(store) {
        this.stores.push(store);
        return this;
    }
    async set(key, value) {
        for (const store of this.stores) {
            await store.set(key, value);
        }
    }
    async get(key) {
        for (const store of this.stores) {
            const value = await store.get(key);
            if (value !== undefined) {
                return value;
            }
        }
    }
}


class MemoryStore {
    constructor() {
        this.cache = new LRUCache({
            max: 100,
            ttl: 1000 * 60 * 60 * 24
        });
    }
    async set(key, value) {
        this.cache.set(key, value);
    }
    async get(key) {
        return this.cache.get(key);
    }
}

class RedisStore {
    constructor(options = { host: 'localhost', port: '6379' }) {
        this.client = new Redis();
    }
    async set(key, value) {
        await this.client.set(key, JSON.stringify(value));
    }
    async get(key) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : undefined;
    }
}
const cacheMiddleware = (options) => {
    return async function (ctx, next) {
        const cacheStore = new CacheStore();
        cacheStore.add(new MemoryStore());
        cacheStore.add(new RedisStore(options));
        ctx.cache = cacheStore;
        await next();
    }
}

module.exports = cacheMiddleware;