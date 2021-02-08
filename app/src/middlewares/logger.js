const winston = require('winston')
// const winston = require('winston-logstash-transport') PARA LOGSTASH

/* PARA LOGGEAR EN LOGSTASH
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp()
    ),
    transports: [
        new winston.transports.Console(),
        new LogstashTransport({host: 'HOST_REMOTO', port: 11111})
    ]
})
*/

const logger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.File({ filename: 'audit.log', level: 'info' })
    ],
  });

// PARA ESTA OCACION VAMOS A REGISTRAR EN UN ARCHIVO, PERO EL MODULO DE LOGSTASH ESTA PREPARADO Y FUNCIONA
exports.loggerTransactions = (req, res, next, context) => {
    const { user, email } = req.body
    const apiToken = req.query.apiToken
    const token = req.headers["authorization"]
    const ipAddress = req.connection.remoteAddress
    const timeStamp = new Date()
    logger.info({ timeStamp, user, email, apiToken, context, token, ipAddress })
    next()
}