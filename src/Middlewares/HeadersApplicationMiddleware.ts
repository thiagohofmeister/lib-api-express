import { NextFunction, Response } from 'express'
import { IRequest } from '../Handlers/Interfaces'

export const headersApplicationMiddleware = (request: IRequest, response: Response, next: NextFunction) => {

  if (!request.header('X-Auth-User-Id')) {
    response
      .status(400)
      .json({
        message: 'User id is required'
      })
    return
  }

  if (!request.header('X-Auth-User-Email')) {
    response
      .status(400)
      .json({
        message: 'User email is required'
      })
    return
  }

  return next()
}