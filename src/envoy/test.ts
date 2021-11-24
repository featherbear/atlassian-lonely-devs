import winston from 'winston'
import Envoy from './authCycle'

global.logger = winston.createLogger({
  level: 'debug',
  transports: [new winston.transports.Console()]
})

Envoy.suite()
