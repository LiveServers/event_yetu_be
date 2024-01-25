/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type NextFunction, type Request, type Response, type Application } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import { port, environment, listOfOriginsAllowed } from './util/secrets'
import mountRoutes from './routers/index.router'

// For env File
dotenv.config()

const app: Application = express()

app.set('port', port)
app.use(express.json())
app.use(helmet({ contentSecurityPolicy: environment === 'production' ? undefined : false }))

const originList = listOfOriginsAllowed.split(',')
const options: cors.CorsOptions = {
  origin: originList,
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE'
}
app.use(cors(options))

mountRoutes(app)

interface Result {
  message: string
  code: number
}

const mapErrorNamesToMessage = (errName: string, error: string): Result => {
  switch (errName) {
    case 'PrismaClientKnownRequestError': return {
      message: 'An error occured, try again later',
      code: 500
    }
    case 'PrismaClientUnknownRequestError': return {
      message: 'Unexpected error occured',
      code: 500
    }
    case 'PrismaClientRustPanicError': return {
      message: 'Unexpected error occured',
      code: 500
    }
    case 'PrismaClientInitializationError': return {
      message: 'Error when querying backend',
      code: 500
    }
    case 'PrismaClientValidationError': return {
      message: 'Validation failed',
      code: 500
    }
    case 'NotFoundError': return {
      message: 'Invalid details',
      code: 422
    }
    case 'Error': return {
      message: error,
      code: 500
    }
    default: return {
      message: 'An error occured, kindly try again later',
      code: 500
    }
  }
}
/**
 * TODO: - improve this error handling middleware
 */
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  console.log('MIDDLEWARE ERROR', err.message, err.name)
  const { message, code } = mapErrorNamesToMessage(err.name, err.message)
  res.status(code).json({ message, status: code })
})

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server')
})

export default app
