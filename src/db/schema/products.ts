import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { restaurants } from './restaurants'
import { relations } from 'drizzle-orm'
import { orderItems } from './order-items'

export const products = pgTable('products', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  restaurantId: text('restaurant_id')
    .references(() => restaurants.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  priceInCents: integer('price_in_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const productsRelations = relations(products, ({ one, many }) => {
  return {
    restaurant: one(restaurants, {
      fields: [products.restaurantId],
      references: [restaurants.id],
      relationName: 'product_restaurants_relation',
    }),
    orderItems: many(orderItems),
  }
})
