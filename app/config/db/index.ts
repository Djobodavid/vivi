import {drizzle} from "drizzle-orm/node-postgres"
import {Pool} from "pg"

const pool_connexion = process.env.NODE_ENV=== "production"
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });


export const drizzleDb = drizzle(pool_connexion)