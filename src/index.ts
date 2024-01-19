/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type NextFunction, type Request, type Response, type Application } from 'express'
import dotenv from 'dotenv'
// import { PrismaClient } from '@prisma/client'
import cors from 'cors'
// import session, { Session, SessionData } from 'express-session'
import { expressjwt } from 'express-jwt'
import helmet from 'helmet'
// import connectPgSimple from 'connect-pg-simple'
import { port, sessionSecret, environment, listOfOriginsAllowed } from './util/secrets'
import mountRoutes from './routes'

// For env File
dotenv.config()
// const PostgresqlStore = connectPgSimple(session)
// const sessionStore = new PostgresqlStore({
//   conString: databaseConnectionUrl, // fallback
//   createTableIfMissing: true
// })

const app: Application = express()

app.set('port', port)
app.use(express.json())
// first layer of protection for token
app.use(expressjwt({
  secret: Buffer.from(sessionSecret, 'base64'),
  algorithms: ['HS256'],
  credentialsRequired: false
}))
// app.use(session({
//   store: sessionStore,
//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   secret: sessionSecret,
//   saveUninitialized: false,
//   resave: false,
//   cookie: {
//     secure: environment === 'production',
//     httpOnly: environment === 'production',
//     maxAge: 7 * 24 * 60 * 60 * 1000 // ms 7days
//   }
// }))
app.use(helmet({ contentSecurityPolicy: environment === 'production' ? undefined : false }))

const originList = listOfOriginsAllowed.split(',')
const options: cors.CorsOptions = {
  origin: originList,
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE'
}
app.use(cors(options))

mountRoutes(app)

const mapErrorNamesToMessage = (errName: string) => {
  return {
    PrismaClientKnownRequestError: 'An error occured, try again later',
    PrismaClientUnknownRequestError: 'Unexpected error occured',
    PrismaClientRustPanicError: 'Unexpected error occured',
    PrismaClientInitializationError: 'Error when querying backend',
    PrismaClientValidationError: 'Validation failed',
    default: 'An error occured, kindly try again later'
  }[errName]
}
// handling the error thrown by express-jwt and cors packages(maybe others)
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  console.log('RUSTY', err.message)
  res.status(500).json({ message: mapErrorNamesToMessage(err.name) })
})

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server')
})

export default app
