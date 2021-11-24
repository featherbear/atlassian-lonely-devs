import sirv from 'sirv'
import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import { json } from 'body-parser'
import compression from 'compression'
import * as sapper from '@sapper/server'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

import * as winston from 'winston'
import { decode } from './components/JWT'
import { cookieName } from './components/constants'
global.logger = winston.createLogger({
  level: 'debug',
  transports: [new winston.transports.Console()]
})


dotenv.config()

express()
  .use(
    (req, res, next) => {
      res.OK = function (data) {
        res.end(JSON.stringify({ status: true, data }))
      }

      res.FAIL = function (error) {
        res.end(JSON.stringify({ status: false, error }))
      }

      next()
    },
    compression({ threshold: 0 }),
    json(),
    cookieParser(),
    sirv('static', { dev }),
    sapper.middleware({
      session: (req, res) => decode(req.cookies[cookieName])
    })
  )
  .listen(PORT, () => {
    logger.info("Server started")
  })

declare global {
  namespace Express {
    interface Response {
      OK: (data) => void
      FAIL: (error) => void
    }
  }
}
