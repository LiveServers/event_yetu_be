/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Router } from 'express'
import user from '../controllers/User'
import { createSignUpValidator } from '../util/formValidations'

const router: Router = express.Router()

router.post('/create-user', createSignUpValidator, user.createUser)
// test
router.get('/get-users', user.fetchUsers)
// add auth
router.get('/get-user/:email', user.fetchUser)

export default router
