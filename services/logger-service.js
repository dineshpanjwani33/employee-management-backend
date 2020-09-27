const winston = require('winston');

dateFormat = () => {
    return new Date(Date.now()).toUTCString()
};

//Defining logger service for error and info messages
class LoggerService {
    constructor(model) {
        this.model = model
        const logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: `./logs/${model}.log`
                })
            ],
            format: winston.format.printf((info) => {
                let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${model}.log | ${info.message} | `
                return message
            })
        });
        this.logger = logger
    }
    async info(message) {
        this.logger.log('info', message);
    }
    async error(message) {
        this.logger.log('error', message);
    }
}
module.exports = LoggerService
