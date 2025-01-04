import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { restaurants, users } from '../../db/schema'

export const registerRestaurant = new Elysia().post(
  '/restaurants',
  async ({ body, set }) => {
    const { restaurantName, restaurantDescription, name, phone, email } = body

    const [manager] = await db
      .insert(users)
      .values([
        {
          name,
          phone,
          email,
          role: 'manager',
        },
      ])
      .returning({
        id: users.id,
      })

    const restaurant = await db.insert(restaurants).values([
      {
        name: restaurantName,
        description: restaurantDescription,
        managerId: manager.id,
      },
    ])

    set.status = 204
  },
  {
    body: t.Object({
      restaurantName: t.String(),
      restaurantDescription: t.String(),
      name: t.String(),
      phone: t.String(),
      email: t.String({ format: 'email' }),
    }),
  },
)
