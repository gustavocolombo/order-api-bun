import { Elysia, t } from 'elysia'
import { db } from '../../db/connection'
import { authLinks, restaurants } from '../../db/schema'
import { eq } from 'drizzle-orm'
import dayjs from 'dayjs'
import { auth } from '../auth'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, signUser, set }) => {
    const { code, redirect } = query

    const [authLinkFromCode] = await db
      .select()
      .from(authLinks)
      .where(eq(authLinks.code, code))

    if (!authLinkFromCode) throw new Error('Auth code not found')

    const diffInDays = dayjs().diff(authLinkFromCode.createdAt, 'days')

    if (diffInDays > 7)
      throw new Error('Auth link is expired, please generate a new one')

    const [managedRestaurants] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.managerId, authLinkFromCode.userId))

    await signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurants?.id,
    })

    await db.delete(authLinks).where(eq(authLinks.code, authLinkFromCode.code))

    set.redirect = redirect
  },
  {
    query: t.Object({
      code: t.String(),
      redirect: t.String(),
    }),
  },
)
