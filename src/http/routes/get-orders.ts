import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { orders, users } from '../../db/schema'
import { db } from '../../db/connection'
import { and, count, desc, eq, ilike, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-typebox'

export const getOrders = new Elysia().use(auth).get(
  '/orders',
  async ({ getCurrentUser, query }) => {
    const { customerName, orderId, status, pageIndex } = query
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) throw new Error('User is not a manager')

    const baseQuery = db
      .select({
        oderId: orders.id,
        customerName: users.name,
        createdAt: orders.createdAt,
        status: orders.status,
        total: orders.totalInCents,
      })
      .from(orders)
      .innerJoin(users, eq(users.id, orders.customerId))
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          orderId ? ilike(orders.id, `%${orderId}%`) : undefined,
          status ? eq(orders.status, status) : undefined,
          customerName ? ilike(users.name, `%${customerName}%`) : undefined,
        ),
      )

    const [amounOfOrdersQuery, allOrders] = await Promise.all([
      db.select({ count: count() }).from(baseQuery.as('baseQuery')),
      db
        .select()
        .from(baseQuery.as('baseQuery'))
        .offset(pageIndex * 10)
        .limit(10)
        .orderBy((fields) => {
          return [
            sql`CASE ${fields.status}
              WHEN 'pending' THEN 1
              WHEN 'processing' THEN 2
              WHEN 'delivering' THEN 3
              WHEN 'delivered' THEN 4
              WHEN 'canceled' THEN 99
            END`,
            desc(sql`"baseQuery"."created_at"`),
          ]
        }),
    ])

    const amountOfOrders = amounOfOrdersQuery[0].count

    return {
      orders: allOrders,
      meta: {
        pageIndex,
        perPage: 10,
        totalCount: amountOfOrders,
      },
    }
  },
  {
    query: t.Object({
      customerName: t.Optional(t.String()),
      orderId: t.Optional(t.String()),
      status: t.Optional(createSelectSchema(orders).properties.status),
      pageIndex: t.Numeric({ minimum: 0 }),
    }),
  },
)
