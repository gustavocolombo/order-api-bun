import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { orders, products } from './index'
import { relations } from 'drizzle-orm'

export const orderItems = pgTable('orderItems', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, {
      onDelete: 'cascade',
    }),
  productsId: text('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  priceInCents: integer('priceInCents').notNull(),
  quantity: integer('quantity').notNull(),
})

export const orderItemsRelations = relations(orderItems, ({ one }) => {
  return {
    order: one(orders, {
      fields: [orderItems.orderId],
      references: [orders.id],
      relationName: 'order_item_oder_relation',
    }),
    product: one(products, {
      fields: [orderItems.productsId],
      references: [products.id],
      relationName: 'order_item_product_relation',
    }),
  }
})
