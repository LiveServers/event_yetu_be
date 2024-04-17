/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Router } from 'express'
import upload from '../controllers/Upload/upload.controller'
import { authenticate } from '../middleware/auth.jwt.guard.middleware'

const router: Router = express.Router()

router.get('/get-upload-url', [authenticate], upload.generatePresignedUrl)

export default router
