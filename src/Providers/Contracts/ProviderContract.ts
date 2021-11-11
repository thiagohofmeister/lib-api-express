import { BaseRequest } from '../../Modules/Request/BaseRequest'

export class ProviderContract<TRequest extends BaseRequest> {
  public constructor(readonly request: TRequest) {}

  /**
   * Retorna uma instancia do requisição.
   */
  protected getRequest(): TRequest {
    return this.request.createInstance().withHeaders(this.getDefaultHeaders())
  }

  /**
   * Retorna os cabeçalhos padrões para a requisição.
   *
   * @returns {any}
   */
  protected getDefaultHeaders(): any {
    return {}
  }
}
