import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const approveOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/approve',
  async ({ set, getCurrentUser, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new Error('User is not a manager')

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId))

    if (!order) {
      set.status = 400
      return { message: 'Order not found' }
    }

    if (order.status !== 'pending') {
      set.status = 400
      return { message: 'Order is not pending to approve' }
    }

    await db
      .update(orders)
      .set({ status: 'processing' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)
