const amqplib = require('amqplib');
const mqMiddleware = () => {
    return async function (ctx, next) {
        const mqClient = await amqplib.connect('amqp://localhost');
        const logger = await mqClient.createChannel();
        await logger.assertQueue('logger');
        ctx.channels = {
            logger
        }
        await next();
    }
};

module.exports = mqMiddleware;
