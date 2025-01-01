import './src/config-env'
import { defineConfig } from 'drizzle-kit'
import { env } from './src/env'

export default defineConfig({
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
