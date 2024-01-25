/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { type Router } from 'express'
import user from '../controllers/User/user.controller'
import { signUpValidator, signInValidator, updateUserValidator } from '../util/form.validations'
import { authenticate } from '../middleware/auth.jwt.guard.middleware'
import { roleGuard } from '../middleware/role.guard.middleware'

const router: Router = express.Router()

router.post('/sign-up', signUpValidator, user.signUp)

router.get('/get-users', [authenticate, roleGuard(['ADMIN'])], user.fetchUsers)

router.post('/sign-in', signInValidator, user.signIn)

router.get('/get-user/:email', authenticate, user.fetchUser)

router.patch('/update-account/:email', updateUserValidator, authenticate, user.updateAccount)

router.delete('/delete-account/:email', authenticate, user.deleteAccount)

router.post('/sign-out/:email', authenticate, user.signOut)

/**
 * TODO: - add rate limit
 */
router.post('/refresh-token', user.refreshToken)

export default router
