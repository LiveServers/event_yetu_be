import jwt, { type JwtPayload } from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'
import isEmpty from 'lodash.isempty'
import { sessionSecret } from './secrets'
import { type AuthRequest } from '../interfaces/auth.interface'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const accessToken: string = req.headers.authorization ?? ''
  const refreshToken: string = req.cookies.refreshToken ?? ''

  if (isEmpty(accessToken) && isEmpty(refreshToken)) {
    return res.status(401).send('Access Denied. No token provided.')
  }

  try {
    const decoded = jwt.verify(accessToken, sessionSecret) as JwtPayload
    (req as AuthRequest).user = decoded.user
    next()
  } catch (error) {
    if (isEmpty(refreshToken)) {
      return res.status(401).send('Access Denied. No refresh token provided.')
    }

    try {
      const decoded = jwt.verify(refreshToken, sessionSecret) as JwtPayload
      const accessToken = jwt.sign({ user: decoded.user }, sessionSecret, { expiresIn: '1h' })

      res
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
        .header('Authorization', accessToken)
        .send(decoded.user)
    } catch (error) {
      return res.status(400).send('Invalid Token.')
    }
  }
}
