import { Response } from 'express'
import { ItemDetail, ItemDetailXML, ItemList, ItemListXML, SuccessContract } from '../../Entities/Domain/Response'

export class HttpHandlerContract {

  /**
   * Gera a resposta de sucesso da API.
   *
   * @param {SuccessContract} result
   * @param {Response} response
   */
  public response (result: SuccessContract, response: Response) {

    if (result instanceof ItemList) {

      response
        .status(200)
        .json({
          items: result.items,
          total: result.total
        })

    } else if (result instanceof ItemDetail) {

      if (result.items === null) {
        response
          .status(204)
          .send()
        return
      }

      response
        .status(result.newItem ? 201 : 200)
        .json(result.items)

    } else if (result instanceof ItemListXML) {

      response
        .set('Content-Type', 'application/xml')
        .status(200)
        .send(result.items)

    } else if (result instanceof ItemDetailXML) {

      if (result.items === null) {
        response
          .status(204)
          .send()
        return
      }

      response
        .set('Content-Type', 'application/xml')
        .status(result.newItem ? 201 : 200)
        .send(result.items)
    } else {
      response
        .status(204)
        .send()
    }
  }
}