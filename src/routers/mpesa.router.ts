/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Router } from 'express'
import mpesa from '../controllers/Mpesa/mpesa.controller'
import { mpesaRequestValidator } from '../util/form.validations'
import { authenticate } from '../middleware/auth.jwt.guard.middleware'

const router: Router = express.Router()

router.post('/process-payment', mpesaRequestValidator, [authenticate], mpesa.processMpesaRequest)

export default router
