import { type Application } from 'express'
import user from './user'

export default function (app: Application) {
  app.use('/api/v1/user', user)
}
