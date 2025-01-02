import { Elysia, t } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { jwt } from '@elysiajs/jwt'
import { cookie } from '@elysiajs/cookie'
import { env } from '../env'

const app = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET,
      schema: t.Object({
        sub: t.String(),
        restaurantId: t.Optional(t.String()),
      }),
      exp: '1d',
    }),
  )
  .use(cookie())
  .use(registerRestaurant)
  .use(sendAuthLink)

app.listen(3333, () => {
  console.log('Bun server started on port 3333!')
})
