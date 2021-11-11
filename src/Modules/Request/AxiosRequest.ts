import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ProviderResponse } from '../../Entities/Domain/ProviderResponse'
import { HttpMethod } from '../../Providers/Enum/HttpMethod'
import { BaseRequest } from './BaseRequest'

export class AxiosRequest extends BaseRequest<AxiosInstance> {
  constructor(private baseURL: string) {
    super()
  }

  public clear(): this {
    this.instance = null
    this.params = null
    this.payload = null
    this.endpoint = null
    return this
  }

  public createInstance(): this {
    if (this.instance) throw new Error('Instance already exists.')

    this.instance = axios.create({
      baseURL: this.baseURL
    })

    return this
  }

  public withHeaders(headers: any): this {
    this.instance.defaults.headers = headers
    return this
  }

  public addHeader(name: string, value: string): this {
    this.instance.defaults.headers = {
      ...this.instance.defaults.headers,
      [name]: value
    }
    return this
  }

  public getFullEndpoint(): string {
    let endpoint = this.endpoint
    if (this.params) {
      const params = []
      Object.keys(this.params).forEach(key => {
        params.push(`${key}=${this.params[key]}`)
      })

      endpoint += `${endpoint?.includes('?') ? '&' : '?'}${params.join('&')}`
    }

    return endpoint
  }

  public addRequestInterceptor(
    onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    return this.instance.interceptors.request.use(onFulfilled, onRejected)
  }

  public removeRequestInterceptor(interceptor: number): this {
    this.instance.interceptors.request.eject(interceptor)
    return this
  }

  public addResponseInterceptor<Value>(
    onFulfilled?: (
      value: AxiosResponse<Value>
    ) => AxiosResponse<Value> | Promise<AxiosResponse<Value>>,
    onRejected?: (error: AxiosError<Value>) => any
  ): number {
    return this.instance.interceptors.response.use(onFulfilled, onRejected)
  }

  public removeResponseInterceptor(interceptor: number): this {
    this.instance.interceptors.response.eject(interceptor)
    return this
  }

  public async send<T = any>(
    method: HttpMethod,
    clearOnFinish: boolean = true
  ): Promise<ProviderResponse<T>> {
    try {
      let response: AxiosResponse<T> = null

      switch (method) {
        case HttpMethod.DELETE:
          response = await this.instance.delete(this.getFullEndpoint())
          break

        case HttpMethod.GET:
          response = await this.instance.get(this.getFullEndpoint())
          break

        case HttpMethod.PATCH:
          response = await this.instance.patch(this.getFullEndpoint(), this.getPayload())
          break

        case HttpMethod.POST:
          response = await this.instance.post(this.getFullEndpoint(), this.getPayload())
          break

        case HttpMethod.PUT:
          response = await this.instance.put(this.getFullEndpoint(), this.getPayload())
          break
      }

      return new ProviderResponse(response.status, response.data)
    } catch (err) {
      throw err
    } finally {
      clearOnFinish && this.clear()
    }
  }
}
