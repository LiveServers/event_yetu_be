import dotenv from 'dotenv'

dotenv.config()

export const port = process.env.PORT ?? 8000
export const environment = process.env.NODE_ENV ?? 'developmemt'
export const sessionSecret = process.env.SESSION_SECRET ?? ''
export const databaseConnectionUrl = process.env.DATABASE_URL ?? ''
export const listOfOriginsAllowed = process.env.ORIGIN ?? ''
export const bcryptSaltRounds = process.env.BCRYPT_SALT_ROUNDS ?? 10
