import axios, { AxiosPromise } from 'axios'
import { IContext } from '../../Handlers/Interfaces'
import { IEntityDataMapper } from '../../DataMappers/Interfaces'
import { HttpMethod } from '../Enum'

export class AxiosProviderContract<TDomainEntity, TDaoEntity> {

  /**
   * Contexto retornado pelo Gateway.
   *
   * @property {IContext} context
   */
  protected readonly context: IContext

  /**
   * Conversor dos dados entre banco de dados e domínio.
   *
   * @template TDomainEntity
   * @template TDaoEntity
   *
   * @property {IEntityDataMapper<TDomainEntity, TDaoEntity>} dataMapper
   */
  protected readonly dataMapper: IEntityDataMapper<TDomainEntity, TDaoEntity>

  /**
   * Url base do recurso.
   *
   * @property {string} baseURL
   */
  protected readonly baseURL: string

  public constructor (
    context: IContext,
    dataMapper: IEntityDataMapper<TDomainEntity, TDaoEntity>
  ) {
    this.context = context
    this.dataMapper = dataMapper
  }

  /**
   * Faz uma requisição em uma url.
   *
   * @param {HttpMethod} method
   * @param {string} endpoint
   * @param {string} path
   * @param {any} payload
   */
  protected getRequest (method: HttpMethod, endpoint: string, path: string, payload: any = null): AxiosPromise {
    const client = axios.create({
      baseURL: this.baseURL,
      headers: this.getRequestHeaders()
    })

    switch (method) {
      case HttpMethod.DELETE:
        return client.delete(`${endpoint}/${path}`)

      case HttpMethod.GET:
        return client.get(`${endpoint}/${path}`)

      case HttpMethod.PATCH:
        return client.patch(`${endpoint}/${path}`, payload)

      case HttpMethod.POST:
        return client.post(`${endpoint}/${path}`, payload)

      case HttpMethod.PUT:
        return client.put(`${endpoint}/${path}`, payload)

      default:
        return null
    }
  }

  /**
   * Retorna os cabeçalhos para a requisição.
   *
   * @returns {any}
   */
  protected getRequestHeaders (): any {
    return {}
  }
}
