/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type Request, type Response, type NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import isEmpty from 'lodash.isempty'
import { type CreateUser, type UpdateUser } from '../../interfaces/auth.interface'
import { bcryptSaltRounds } from '../../util/secrets'
import excludeFields from '../../util/excludeFields'

const prisma = new PrismaClient()

/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.body - The request body
 * @param {string} req.body.firstName - The user's firstName
 * @param {string} req.body.lastName - The user's lastName
 * @param {string} req.body.role - The user's role
 * @param {string} req.body.email - The user's email
 * @param {string} req.body.password - The user's password
 * @param {string} req.body.avatar - The user's avatar - optional(we will upload to s3 and return the presigned url)
 * @returns {Promise<void> | void}
 */
const signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      // if request params meet the validation criteria
      const userBody: CreateUser = req.body
      const hashedPassword = await bcrypt.hash(userBody.password, Number(bcryptSaltRounds))
      userBody.password = hashedPassword
      userBody.creationDate = new Date()
      userBody.updateTime = new Date()
      await prisma.user.create({
        data: { ...userBody }
      })
      /**
       * TODO: - send an email for verification before allowing user to sign in
       */
      res.status(200).json({
        status: 200,
        message: 'User successfully created'
      })
      return
    }
    res.status(422).json({ errors: errors.array() })
  } catch (e) {
    next(e)
  }
}
/**
 * @param req
 * @param res
 * @param next
 */
const fetchUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany()
    const filteredUsers = []
    for (const user of users) {
      filteredUsers.push(excludeFields(user, ['password', 'role', 'id']))
    }
    res.status(200).json(filteredUsers)
  } catch (e) {
    next(e)
  }
}

/**
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.params.email - The users email
 */
const fetchUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.email !== req.params.email) {
      res.status(401).json({
        message: 'Unauthorized User',
        status: 401
      })
      return
    }
    if (!req.params.email) {
      res.status(400).json({
        message: 'Invalid request',
        status: 400
      })
      return
    }
    const user = await prisma.user.findUnique({
      where: {
        email: req.params.email
      }
    })
    res.status(200).json(excludeFields(user, ['password', 'role', 'id']))
  } catch (e) {
    next(e)
  }
}

/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.body - The request body
 * @param {string} req.body.email - The user's email
 * @param {string} req.body.password - The user's password
 * @returns {Promise<void> | void}
 */
const signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: req.body.email
        }
      })
      if (user.isVerified) {
        throw new Error('Please verify your account to proceed')
      }
      const match = await bcrypt.compare(req.body.password as string, user.password)
      if (!match) {
        throw new Error('Invalid username or password')
      }
      // always update the secret key
      const salt = bcrypt.genSaltSync(Number(bcryptSaltRounds))
      await prisma.user.update({
        where: {
          email: req.body.email
        },
        data: {
          personalKey: salt
        }
      })
      // create a token
      const excluded = excludeFields(user, ['password', 'avatar', 'createdEvents', 'bookedEvents', 'eventsCreated', 'ticketsBought', 'creationDate', 'updateTime', 'phoneNumber', 'role', 'email', 'personalKey', 'isVerified'])
      const accessToken = jwt.sign(excluded as object, Buffer.from(salt, 'base64'), { expiresIn: '1h' })
      const refreshToken = jwt.sign(excluded as object, Buffer.from(salt, 'base64'), { expiresIn: '1d' })
      res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
        .header('Authorization', accessToken)
        .json({
          message: 'Sign in successful',
          status: 200
        })
      return
    }
    res.status(422).json({ errors: errors.array() })
  } catch (e) {
    next(e)
  }
}

/**
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {string} req.body.email - The user's email
 * @returns {Promise<void> | void}
 */
const signOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.email !== req.params.email) {
      res.status(401).json({
        message: 'Unauthorized User',
        status: 401
      })
      return
    }
    if (!req.params.email) {
      res.status(400).json({
        message: 'Invalid request',
        status: 400
      })
      return
    }
    // we will remove the personalKey from the db
    await prisma.user.update({
      where: {
        email: req.params.email
      },
      data: {
        personalKey: ''
      }
    })
    res.status(200).json({ message: 'You have been logged out successfully', status: 200 })
  } catch (e) {
    next(e)
  }
}
/**
 * @param req
 * @param res
 * @param next
 */
const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken: string = req.headers.cookie ?? ''
    if (isEmpty(refreshToken)) {
      res.status(401).json({
        message: 'Access Denied. No token provided.',
        status: 401
      })
      return
    }
    const decoded = jwt.decode(refreshToken.replace('refreshToken=', ''), { complete: true }) as JwtPayload
    const userData = await prisma.user.findUniqueOrThrow({
      where: {
        id: decoded.payload.id
      }
    })

    const verified = jwt.verify(refreshToken.replace('refreshToken=', ''), Buffer.from(userData.personalKey!, 'base64')) as JwtPayload
    // always update the secret key
    const salt = bcrypt.genSaltSync(Number(bcryptSaltRounds))
    await prisma.user.update({
      where: {
        id: decoded.payload.id
      },
      data: {
        personalKey: salt
      }
    })
    const accessToken = jwt.sign({ id: verified.id, firstName: verified.firstName, lastName: verified.lastName }, Buffer.from(salt, 'base64'), { expiresIn: '1h' })
    const refreshedToken = jwt.sign({ id: verified.id, firstName: verified.firstName, lastName: verified.lastName }, Buffer.from(salt, 'base64'), { expiresIn: '1d' })
    res
      .cookie('refreshToken', refreshedToken, { httpOnly: true, sameSite: 'strict' })
      .header('Authorization', accessToken)
      .json({
        message: 'Access token generated successfully',
        status: 200
      })
  } catch (e) {
    next(e)
  }
}
/**
 * @param req
 * @param res
 * @param next
 */
const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.email !== req.params.email) {
      res.status(401).json({
        message: 'Unauthorized User',
        status: 401
      })
      return
    }
    if (!req.params.email) {
      res.status(400).json({
        message: 'Invalid request',
        status: 400
      })
      return
    }
    await prisma.user.delete({
      where: {
        email: req.params.email
      }
    })
    res.status(200).json({ message: 'Your account has successfully been deleted', status: 200 })
  } catch (e) {
    next(e)
  }
}
/**
 * @param req
 * @param res
 * @param next
 */
const updateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.email !== req.params.email) {
      res.status(401).json({
        message: 'Unauthorized User',
        status: 401
      })
      return
    }
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const user: UpdateUser = req.body
      user.updateTime = new Date()
      await prisma.user.update({
        where: {
          email: req.params.email
        },
        data: { ...user }
      })
      res.status(200).json({
        message: 'Update complete',
        status: 200
      })
      return
    }
    res.status(422).json({ errors: errors.array() })
  } catch (e) {
    next(e)
  }
}

export default {
  signUp,
  fetchUsers,
  fetchUser,
  signIn,
  signOut,
  refreshToken,
  deleteAccount,
  updateAccount
}
