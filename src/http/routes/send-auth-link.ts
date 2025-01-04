import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { authLinks, users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { env } from '../../env'
import { mailer } from '../../lib/mail'
import nodemailer from 'nodemailer'

export const sendAuthLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const [userFromEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (!userFromEmail) throw new Error('User not found')

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      code: authLinkCode,
      userId: userFromEmail.id,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)

    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.API_REDIRECT_URL)

    const sendedEmail = await mailer.sendMail({
      from: {
        name: 'PizzaShop',
        address: 'hi@pizzashop.com',
      },
      to: email,
      subject: 'Authenticate to PizzaShop',
      text: `Use the following link to authenticate on PizzaShop: ${authLink.toString()}`,
    })

    console.log(nodemailer.getTestMessageUrl(sendedEmail))
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
