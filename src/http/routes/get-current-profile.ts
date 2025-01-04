import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const getCurrentProfile = new Elysia()
  .use(auth)
  .get('/me', async ({ getCurrentUser }) => {
    const { userId } = await getCurrentUser()

    const [user] = await db.select().from(users).where(eq(users.id, userId))

    if (!user) throw new Error('User not found')

    return user
  })
