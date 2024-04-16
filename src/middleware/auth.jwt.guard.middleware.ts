/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */
/* eslint-disable max-len */
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'
import isEmpty from 'lodash.isempty'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken: string = req.headers?.authorization ?? ''
  if (isEmpty(accessToken)) {
    return res.status(401).json({
      message: 'Access Denied. No token provided.',
      status: 401
    })
  }

  try {
    const decoded = jwt.decode(accessToken.replace('Bearer ', ''), { complete: true }) as JwtPayload
    const userData = await prisma.user.findUniqueOrThrow({
      where: {
        id: decoded.payload.id
      }
    })
    jwt.verify(accessToken.replace('Bearer ', ''), Buffer.from(userData.personalKey as string, 'base64')) as JwtPayload
    req.role = userData.role
    req.email = userData.email
    req.id = userData.id
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid Token.',
      status: 401
    })
  }
}
