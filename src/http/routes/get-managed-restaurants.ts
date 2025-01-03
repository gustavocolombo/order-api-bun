import Elysia from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { restaurants } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const getManagedRestaurants = new Elysia()
  .use(auth)
  .get('/managed-restaurants', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new Error('User is not a manager')

    const [managedRestaurants] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId))

    return managedRestaurants
  })
