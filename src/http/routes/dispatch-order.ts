import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const dispatchOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/dispatch',
  async ({ set, getCurrentUser, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new Error('User is not a manager')

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId))

    if (!order) throw new Error('Order not found')

    if (order.status !== 'processing') {
      set.status = 400
      return {
        message:
          'You cannot dispatch an order that are not in "processing" status',
      }
    }

    await db
      .update(orders)
      .set({ status: 'delivering' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
