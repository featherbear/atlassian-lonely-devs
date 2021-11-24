import jwt from 'jsonwebtoken'

import dotenv from 'dotenv'
dotenv.config()

const { APP_SECRET } = process.env

if (!APP_SECRET?.trim()) throw new Error('APP_SECRET not defined')

export function decode (token) {
  if (!token) return null
  try {
    return jwt.verify(token, APP_SECRET)
  } catch (e) {
    logger.debug("Failed to decode JWT " + token)
    // console.log(e);
    return null
  }
}

export function encode (payload, { ...opts } = {}) {
  return jwt.sign(payload, APP_SECRET, { expiresIn: '5m', ...opts })
}
