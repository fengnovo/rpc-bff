const {
    registry: { ZookeeperRegistry },
    client: { RpcClient }
} = require('sofa-rpc-node');

const logger = console;

const registry = new ZookeeperRegistry({
    logger,
    address: '127.0.0.1:2181'
});


(async function () {
    const client = new RpcClient({
        logger,
        registry
    });
    const consumer = client.createConsumer({
        interfaceName: 'com.keen.post'
    });
    await consumer.ready();
    const result = await consumer.invoke('getPostCount', [1]);
    console.log(result);
    process.exit(0);

})();