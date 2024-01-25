/* eslint-disable max-len */
import { check } from 'express-validator'

export const signUpValidator = [
  check('firstName').notEmpty().withMessage('Firstname is required').isLength({ min: 2 }).withMessage('Firtname must not be less than 2 characters'),
  check('lastName').notEmpty().withMessage('Lastname is required').isLength({ min: 2 }).withMessage('Lastname must not be less than 2 characters'),
  check('password').isStrongPassword(),
  check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  check('role').notEmpty().withMessage('Role is required').isIn(['USER', 'ADMIN']),
  check('avatar').optional().isString().withMessage('Avatar must be a string')
]

export const signInValidator = [
  check('password').isStrongPassword(),
  check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email')
]

export const updateUserValidator = [
  check('firstName').optional().isString().withMessage('Firstname must be a string').isLength({ min: 2 }).withMessage('Firtname must not be less than 2 characters'),
  check('lastName').optional().isString().withMessage('Lastname must be a string').isLength({ min: 2 }).withMessage('Lastname must not be less than 2 characters'),
  check('email').optional().isEmail().withMessage('Invalid email'),
  check('role').optional().isString().withMessage('Role must be a string').isIn(['USER', 'ADMIN']),
  check('avatar').optional().isString().withMessage('Avatar must be a string')
]
