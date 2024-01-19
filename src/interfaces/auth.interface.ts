import { type Request } from 'express'
import { type JwtPayload } from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

type RoleKey = 'USER' | 'ADMIN'
export interface CreateUser {
  firstName: string
  lastName: string
  avatar: string
  email: string
  password: string
  role: RoleKey
  creationDate: Date
  updateTime: Date
}
