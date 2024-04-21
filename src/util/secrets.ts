import dotenv from 'dotenv'

dotenv.config()

export const port = process.env.PORT ?? 8000
export const environment = process.env.NODE_ENV ?? 'developmemt'
export const sessionSecret = process.env.SESSION_SECRET ?? ''
export const databaseConnectionUrl = process.env.DATABASE_URL ?? ''
export const listOfOriginsAllowed = process.env.ORIGIN ?? ''
export const bcryptSaltRounds = process.env.BCRYPT_SALT_ROUNDS ?? 10
export const accessKeyId = process.env.ACCESS_KEY_ID
export const secretAccessKey = process.env.SECRET_ACCESS_KEY
export const region = process.env.REGION
export const bucket = process.env.BUCKET
export const key = process.env.KEY
export const algoliaApplicationId = process.env.ALGOLIA_APPLICATION_ID
export const algoliaApiKey = process.env.ALGOLIA_API_KEY
export const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME
