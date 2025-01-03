import { Elysia, t } from 'elysia'
import { db } from '../../db/connection'
import { authLinks, restaurants } from '../../db/schema'
import { eq } from 'drizzle-orm'
import dayjs from 'dayjs'
import { auth } from '../auth'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, jwt, setCookie, set }) => {
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

    const token = await jwt.sign({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurants?.id,
    })

    setCookie('auth', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
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
