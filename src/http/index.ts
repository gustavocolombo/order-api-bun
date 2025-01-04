import { Elysia } from 'elysia'
import { registerRestaurant } from './routes/register-restaurant'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { signOut } from './routes/sign-out'
import { getCurrentProfile } from './routes/get-current-profile'
import { getManagedRestaurants } from './routes/get-managed-restaurants'

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getCurrentProfile)
  .use(getManagedRestaurants)

app.listen(3333, () => {
  console.log('Bun server started on port 3333!')
})
