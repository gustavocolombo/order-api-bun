/* eslint-disable drizzle/enforce-delete-with-where */
import { faker } from '@faker-js/faker'
import { users, restaurants } from '../db/schema'
import { db } from './connection'
import chalk from 'chalk'

await db.delete(users)
await db.delete(restaurants)

console.log(chalk.yellow('Database reset'))

await db.insert(users).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role: 'customer',
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role: 'customer',
  },
])

console.log(chalk.green('Created customers'))

const [managerSeed] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      phone: faker.phone.number(),
      role: 'manager',
    },
  ])
  .returning({
    id: users.id,
  })

console.log(chalk.green('Created manager'))

await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: managerSeed.id,
  },
])

console.log(chalk.green('Created restaurant'))

console.log(chalk.greenBright('Database seeded successfully'))

process.exit()
