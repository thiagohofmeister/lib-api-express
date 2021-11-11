import { IDetail } from '../Interfaces/IDetail'

export class BaseError extends Error {
  private code: string

  constructor(public message: string, private details: IDetail[] = []) {
    super()
  }

  public setMessage(message: string): this {
    this.message = message
    return this
  }

  public getMessage(): string {
    return this.message
  }

  public addDetails(details: IDetail): this {
    if (!this.details) this.details = []

    this.details.push(details)
    return this
  }

  public getDetails(): IDetail[] {
    return this.details
  }

  public setCode(code: string): this {
    this.code = code
    return this
  }

  public getCode(): string {
    if (!this.code)
      return `${this.constructor.name.substr(0, 1).toLowerCase()}${this.constructor.name.substr(1)}`

    return this.code
  }
}
