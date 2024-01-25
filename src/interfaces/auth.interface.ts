import { type Request } from 'express'
import { type JwtPayload } from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export interface DecodedJwt {
  id: number
  firstName: string
  lastName: string
}

export type RoleKey = 'USER' | 'ADMIN'
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

export interface UpdateUser {
  firstName?: string
  lastName?: string
  avatar?: string
  email?: string
  role?: RoleKey
  updateTime: Date
}
