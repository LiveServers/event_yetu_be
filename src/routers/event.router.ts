/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Router } from 'express'
import event from '../controllers/Event/event.controller'
import { createEventValidator, fetchEventsValidator, editEventValidator } from '../util/form.validations'
import { authenticate } from '../middleware/auth.jwt.guard.middleware'
import { roleGuard } from '../middleware/role.guard.middleware'

const router: Router = express.Router()

router.post('/create-event', createEventValidator, [authenticate, roleGuard(['ADMIN'])], event.createEvent)
router.get('/fetch-events', fetchEventsValidator, [authenticate], event.fetchEvents)
router.patch('/edit-event', editEventValidator, [authenticate], event.editEvent)

export default router
