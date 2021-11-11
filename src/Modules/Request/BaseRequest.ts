import { ProviderResponse } from '../../Entities/Domain/ProviderResponse'
import { HttpMethod } from '../../Providers/Enum/HttpMethod'

export abstract class BaseRequest<TInstance = any> {
  protected instance: TInstance
  protected params: IParams
  protected payload: any
  protected endpoint: string
  protected headers: { [key: string]: string }

  constructor() {}

  public clear(): this {
    this.instance = null
    this.params = null
    this.payload = null
    this.endpoint = null
    return this
  }

  abstract createInstance(): this

  public withEndpoint(endpoint: string): this {
    this.endpoint = endpoint
    return this
  }

  public withHeaders(headers: any): this {
    this.headers = headers
    return this
  }

  public addHeader(name: string, value: string): this {
    this.headers = {
      ...this.headers,
      [name]: value
    }
    return this
  }

  public withParams(params: IParams): this {
    this.params = params
    return this
  }

  public addParam(name: string, value: string): this {
    this.params = {
      ...this.params,
      [name]: value
    }
    return this
  }

  public getParams(): IParams {
    return this.params
  }

  public withPayload(payload: any): this {
    this.payload = payload
    return this
  }

  public getFullEndpoint(): string {
    return this.endpoint
  }

  public getPayload(): any {
    return this.payload
  }

  public abstract send<T = any>(
    method: HttpMethod,
    clearOnFinish: boolean
  ): Promise<ProviderResponse<T>>
}

export interface IParams {
  [key: string]: string | number | boolean
}
