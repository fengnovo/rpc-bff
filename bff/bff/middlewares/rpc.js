const {
    registry: { ZookeeperRegistry },
    client: { RpcClient }
} = require('sofa-rpc-node');

const logger = console;

const rpcMiddleware = (options = {}) => {
    return async function (ctx, next) {
        const registry = new ZookeeperRegistry({
            logger,
            address: '127.0.0.1:2181'
        });
        const client = new RpcClient({
            logger,
            registry
        });

        const interfaceNames = options.interfaceNames || [];
        const rpcConsumers = {};
        for (let i = 0; i < interfaceNames.length; i++) {
            const interfaceName = interfaceNames[i];
            const consumer = client.createConsumer({
                interfaceName
            });
            await consumer.ready();
            rpcConsumers[interfaceName.split('.').pop()] = consumer;
            // const result = await consumer.invoke('getUserInfo', [1]);
            // console.log(result);
        }
        ctx.rpcConsumers = rpcConsumers;
        await next();

    }
};

module.exports = rpcMiddleware;