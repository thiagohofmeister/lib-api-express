import { Request as ExpressRequest } from 'express'
import { EntityManager } from 'typeorm'
import { IContext } from './IContext'

export interface IRequest extends ExpressRequest {
  entityManager: EntityManager
  context: IContext
}
