const Koa = require('koa');
const router = require('koa-router')();
const logger = require('koa-logger');
const rpcMiddleware = require('./middlewares/rpc');
const cacheMiddleware = require('./middlewares/cache');
const mqMiddleware = require('./middlewares/mq');
const app = new Koa();

app.use(logger());
app.use(rpcMiddleware({
    interfaceNames: [
        'com.keen.user',
        'com.keen.post'
    ]
}));
app.use(cacheMiddleware());
app.use(mqMiddleware());


router.get('/', async (ctx) => {
    const userId = ctx.query.userId;

    ctx.channels.logger.sendToQueue('logger', Buffer.from(JSON.stringify({
        method: ctx.method,
        path: ctx.path,
        userId
    })));

    const cacheKey = `${ctx.method}-${ctx.path}-${userId}`;
    let cacheData = await ctx.cache.get(cacheKey);
    console.log('cacheData--->', cacheData);
    if (cacheData) {
        ctx.body = cacheData;
        return;
    }

    const { rpcConsumers: { user, post } } = ctx;
    const [userInfo, postCount] = await Promise.all([
        user.invoke('getUserInfo', [userId]),
        post.invoke('getPostCount', [userId]),
    ])
    // 脱敏
    delete userInfo.password;
    userInfo.phone = `${userInfo.phone}`.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$2');
    userInfo.avatar = `http://localhost:3000/${userInfo.avatar}`;
    cacheData = {
        userInfo, postCount
    };
    await ctx.cache.set(cacheKey, cacheData);
    ctx.body = cacheData;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
    console.log('http://localhost:3000/?userId=1');
});