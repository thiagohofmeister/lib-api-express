import { NextFunction, Request, Response } from 'express'
import {
  AlreadyExists,
  DataNotFound,
  InvalidData,
  InvalidUserAuthenticationData,
  NotAllowed
} from '../Entities/Domain/Exceptions'
import { IRequest } from '../Handlers/Interfaces'

export class ErrorHandler {
  public constructor () {
    this.notFound = this.notFound.bind(this)
    this.error = this.error.bind(this)
  }

  public notFound (request: IRequest, response: Response, next: NextFunction) {
    return this.error(new DataNotFound('001', 'Resource not found.'), request, response, next)
  }

  public error (error: Error, request: Request, response: Response, next: NextFunction) {
    let httpCode = 500
    let body = {
      code: `${httpCode}.001`,
      message: error.message,
      details: []
    }

    if (error instanceof InvalidUserAuthenticationData) {
      httpCode = 401
      body = {
        ...body,
        code: `${httpCode}.${error.code}`,
        details: error.details
      }
    } else if (error instanceof NotAllowed) {
      httpCode = 403
      body = {
        ...body,
        code: `${httpCode}.${error.code}`,
        details: error.details
      }
    } else if (error instanceof DataNotFound) {
      httpCode = 404
      body = {
        ...body,
        code: `${httpCode}.${error.code}`,
        details: error.details
      }
    } else if (error instanceof AlreadyExists) {
      httpCode = 409
      body = {
        ...body,
        code: `${httpCode}.${error.code}`,
        details: error.details
      }
    } else if (error instanceof InvalidData) {
      httpCode = 422
      body = {
        ...body,
        code: `${httpCode}.${error.code}`,
        details: error.details
      }
    }

    if (httpCode === 500) {
      console.error(error)
    }

    response
      .status(httpCode)
      .json(body)
  }
}
