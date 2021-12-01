import type { Response } from 'express'
import { cookieName } from '../../components/constants'
import { decode, encode } from '../../components/JWT'
import Store from '../../components/Store'
import dayjs from 'dayjs'

export async function get(req, res: Response, next) {
  const { code } = req.query
  const payload = decode(code)

  if (!payload) return res.FAIL('Token is invalid')

  const email = payload.sub as string
  Store.add(email)

  res.cookie(cookieName, encode({ user: email }, { expiresIn: '90 days' }),
    {
      httpOnly: true,
      sameSite: 'strict',
      expires: dayjs().add(90, 'days').toDate()

    })
  return res.redirect("../../")
}
