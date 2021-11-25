import dotenv from 'dotenv'
dotenv.config()

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_TLS,
  APP_URL
} = process.env

import type Mailer from 'nodemailer/lib/mailer'
import type { Request, Response } from 'express'

import nodemailer from 'nodemailer'
import { encode } from '../../components/JWT'

import Mailgen from 'mailgen'

let mailgen = new Mailgen({
  theme: 'salted', product: {
    name: "Lonely Devs",
    link: APP_URL
  }
})

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

export async function post(req: Request, res: Response, next) {
  const { email }: { email: string } = req.body

  // 'Validate' the email
  if (!email?.trim() || !email.toLowerCase().endsWith('@atlassian.com')) {
    return res.FAIL('Invalid email, or something')
  }

  const token = encode({
    sub: email
  })

  let link = `${process.env.APP_URL}/signup/callback?code=${token}`
  await mailer.sendMail({
    to: email,
    from: "Lonely Devs",
    subject: 'Lonely Devs @ Atlassian | Authenticate',
    text: "Hi, you, click, thanks: " + link,
    html: mailgen.generate({
      body: {
        name: "friend",
        outro: "This link will expire in 5 minutes",
        intro: "You've requested to join the Sydney interns desk scheduling directory",
        action: {
          instructions: "Click the button below to continue sign up / sign in",
          button: {
            color: '#33b5e5',
            text: "Confirm account",
            link
          }
        }
      }
    })
  })

  return res.OK('Yay')
}
