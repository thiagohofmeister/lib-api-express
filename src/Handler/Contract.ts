import { Request, Response } from 'express'
import { ServiceContract } from '../Service'
import { ItemDetail, SuccessContract } from '../Response'

export abstract class HandlerContract {
  protected abstract getService (request: Request): ServiceContract

  public response (result: SuccessContract, response: Response) {

    if (result instanceof ItemDetail) {

      if (result.items === null) {
        response
          .status(204)
          .send()
        return
      }

      response
        .status(result.newItem ? 201 : 200)
        .json(result.items)

      return
    }

    response
      .status(200)
      .json({
        items: result.items,
        total: result.total
      })
  }
}
