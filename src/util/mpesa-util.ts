import { consumerKey, consumerSecret, passKey, shortCode, callbackUrl, accountReference, host, path } from './secrets'
const https = require('https')

interface ResponseObject {
  access_token: string
}

export default {
  // get access token
  getAT: async function () {
    const getOptions = {
      host,
      path,
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + Buffer.from(consumerKey
          + ':' + consumerSecret).toString('base64'),
        Accept: 'application/json'
      }
    }
    return await new Promise(function (resolve, reject) {
      https.request(getOptions, function (res: any) {
        res.setEncoding('utf-8')
        res.on('data', function (d: string) {
          resolve(JSON.parse(d))
        })
        res.on('error', function (e: any) {
          reject(e)
        })
      }).end()
    })
  },
  getTimeStamp: function () {
    function parseDate (e: number) { return (e < 10) ? '0' + e : e }
    const currentTime = new Date()
    const month = parseDate(currentTime.getMonth() + 1)
    const date = parseDate(currentTime.getDate())
    const hour = parseDate(currentTime.getHours())
    const minutes = parseDate(currentTime.getMinutes())
    const seconds = parseDate(currentTime.getSeconds())
    console.log('TIMESTAMP', currentTime.getFullYear() + '' + month + '' + date + '' +
    hour + '' + minutes + '' + seconds)
    const time = currentTime.getFullYear() + '' + month + '' + date + '' +
        hour + '' + minutes + '' + seconds
    time.toString()
    return time
  },
  processRequest: async function (amount: string, msidn: string) {
    const postBody = JSON.stringify({
      BusinessShortCode: Number(shortCode),
      Password: Buffer.from(
        Number(shortCode) + (passKey) +
                             this.getTimeStamp())
        .toString('base64'),
      Timestamp: this.getTimeStamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: msidn,
      PartyB: Number(shortCode),
      PhoneNumber: msidn,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: 'Payment For event'
    })
    /* This generates an access_token for each request, and
      returns a promise. */
    const aTPromise = this.getAT()
    return await aTPromise.then(function (resObj: any) {
      return resObj.access_token
    }, function () {
      return ''
    }).then(async function (_at: any) {
      /* If access_token is valid, proceed to invoke the LNM API */
      const postOptions = {
        host,
        path,
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + _at,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postBody, 'utf8')
        }
      }
      return await new Promise(function (resolve, reject) {
        const post = https.request(postOptions, function (res: any) {
          res.setEncoding('utf-8')
          res.on('data', function (d: string) {
            console.log('RESOLVE FUNC', d)
            resolve(JSON.parse(d))
          })
          res.on('error', function (e: any) {
            console.log('REJECT FUNC', e)
            reject(e)
          })
        })
        post.write(postBody)
        post.end()
      })
    })
  }
}
