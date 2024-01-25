import { type Request, type Response, type NextFunction } from 'express'

export const roleGuard = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.includes(req.role)) { next(); return }
    return res.status(403).json({
      message: 'Forbidden',
      status: 403
    })
  }
}
