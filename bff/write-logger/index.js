const amqplib = require('amqplib');
const fs = require('fs-extra');

(async function () {
    const mqClient = await amqplib.connect('amqp://localhost');
    const logger = await mqClient.createChannel();
    await logger.assertQueue('logger');
    logger.consume('logger', async (event) => {
        await fs.appendFile('./logger.txt', event.content.toString() + '\n');
    })
})();