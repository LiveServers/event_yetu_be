import { type Application } from 'express'
import user from './user.router'
import event from './event.router'
import upload from './upload.router'

export default function (app: Application) {
  app.use('/api/v1/user', user)
  app.use('/api/v1/event', event)
  app.use('/api/v1/file-upload', upload)
}
