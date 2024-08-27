import { type Request, type Response, type NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { type MpesaRequestBody } from '../../interfaces/mpesa.interface'
import mpesaUtil from '../../util/mpesa-util'

const processMpesaRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      // let's process the request
      const body: MpesaRequestBody = req.body
      const response = mpesaUtil.processRequest(body.amount, body.msisdn)
      res.status(200).json({
        status: 200,
        message: 'Processing...',
        body: response
      })
    } else {
      res.status(422).json({ errors: errors.array() })
    }
  } catch (e) {
    next(e)
  }
}

export default {
  processMpesaRequest
}
