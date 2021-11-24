import dotenv from 'dotenv'
dotenv.config()

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_TLS
} = process.env

import Mailer from 'nodemailer/lib/mailer'
import nodemailer from 'nodemailer'
import { Request, Response } from 'express'
import Envoy from '../../envoy/authCycle'
import { encode } from '../../components/JWT'

let mailer: Mailer = nodemailer.createTransport(
  {
    host: MAIL_HOST,
    port: Number(MAIL_PORT) || undefined,
    secure: MAIL_TLS?.toLowerCase() === 'true',
    auth: {
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD
    }
  } as any /** brrr types **/
)

export async function get (req: Request, res: Response, next) {
  const { email }: { email: string } = req.body

  // 'Validate' the email
  if (!email?.trim() || !email.toLowerCase().endsWith('@atlassian.com')) {
    return res.FAIL('Invalid email, or something')
  }

  mailer.sendMail({
    to: email,
    subject: 'LonelyDevs | Authenticate',
    text:
      'lol click here no virus i promise: ' +
      encode({
        sub: email
      })
  })

  return res.OK('Yay')
}
