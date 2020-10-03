import { NextFunction, Response } from 'express'
import { IContext, IRequest, RoleTypeRequest } from '../Handlers/Interfaces'

export const makeContext = (request: IRequest, response: Response, next: NextFunction) => {
  const context: IContext = {
    userId: request.header('X-Auth-User-Id'),
    userEmail: request.header('X-Auth-User-Email'),
    userRoleType: null
  }

  if (request.header('X-Auth-User-RoleType')) {
    context.userRoleType = RoleTypeRequest[request.header('X-Auth-User-RoleType').toUpperCase() as string]
  }

  request.context = context

  next()
}
