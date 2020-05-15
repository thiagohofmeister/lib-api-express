import { ErrorHandler } from '../Handler'

export class HandlerFactory {
  public static getErrorHandler () {
    return new ErrorHandler()
  }
}
