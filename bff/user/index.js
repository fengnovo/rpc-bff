const {
    server: { RpcServer },
    registry: { ZookeeperRegistry }
} = require('sofa-rpc-node');

const mysql = require('mysql2/promise');

const logger = console;

const registry = new ZookeeperRegistry({
    logger,
    address: '127.0.0.1:2181'
});

const server = new RpcServer({
    logger,
    registry,
    port: 10000
});

(async function () {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'bff'
    });
    console.log("mysql连接成功");

    server.addService(
        { interfaceName: 'com.keen.user' },
        {
            async getUserInfo(userId) {
                const sql = `SELECT id,username,avatar,password,phone from user WHERE id=${userId} limit 1`;
                const [rows] = await connection.execute(sql);
                return rows[0];
            }
        }
    );
    await server.start();
    await server.publish();
    console.log('微服务已启动！');
})();