/**
 * s3 file upload
 * it would:
 * 1 - generate an s3 presigned url that is sent to the frontend alongside a set of fields
 */

import { type Request, type Response, type NextFunction } from 'express'
import { secretAccessKey, accessKeyId, key, bucket, region } from '../../util/secrets'
const AWS = require('aws-sdk')

const generatePresignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Configure AWS credentials and S3 client
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region
    })

    // Define parameters for generating the presigned URL
    const genKey = `${key}/{filename}`
    const params = {
      Bucket: bucket,
      Key: genKey,
      Expires: 3600 // URL expiration time in seconds (e.g., 1 hour)
    }

    // Generate the presigned URL
    const presignedUrl: string = s3.getSignedUrl('getObject', params)
    const parsedUrl = new URL(presignedUrl)
    const data = {
      url: parsedUrl.origin,
      fields: {
        key: genKey,
        AWSAccessKeyId: parsedUrl.searchParams.get('AWSAccessKeyId'),
        signature: parsedUrl.searchParams.get('Signature')
      }
    }
    res.status(200).json({
      status: 200,
      message: 'Presigned url generated',
      body: data
    })
  } catch (e) {
    next(e)
  }
}

export default {
  generatePresignedUrl
}
