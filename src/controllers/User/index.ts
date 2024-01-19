/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type Request, type Response, type NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { type CreateUser } from '../../interfaces/auth.interface'
import { bcryptSaltRounds } from '../../util/secrets'

const prisma = new PrismaClient()

// Exclude keys from user
// function exclude<User, Key extends keyof User>(
//   user: User,
//   keys: Key[]
// ): Omit<User, Key> {
//   return Object.fromEntries(
//     Object.entries(user).filter(([key]) => !keys.includes(key))
//   )
// }

const excludeFields = (entity: any, fields: any) => {
  for (let i = 0; i < fields.length; i++) {
    delete entity[fields[i]]
  }
  return entity
}

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
const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      // if request params meet the validation criteria
      const userBody: CreateUser = req.body
      const hashedPassword = await bcrypt.hash(userBody.password, Number(bcryptSaltRounds))
      userBody.password = hashedPassword
      userBody.creationDate = new Date()
      userBody.updateTime = new Date()
      // add user to db
      const user = await prisma.user.create({
        data: { ...userBody }
      })
      console.log('USER', user)
      // we'll send an email for verification
      res.status(200).json({
        status: 200,
        message: 'User successfully created'
      })
    }
    res.status(422).json({ errors: errors.array() })
  } catch (e) {
    next(e)
  }
}

// to remove
const fetchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany()
    // const userWithoutPassword = exclude(users, ['password'])
    console.log('USERS FOUND', users)
    res.status(200).json(users)
  } catch (e) {
    next(e)
  }
}

/**
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Object} req.params.email - The users email
 */
const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.params.email
      }
    })
    console.log('Specific User', user)
    res.status(200).json(excludeFields(user, ['password', 'role']))
  } catch (e) {
    next(e)
  }
}

export default {
  createUser,
  fetchUsers,
  fetchUser
}
