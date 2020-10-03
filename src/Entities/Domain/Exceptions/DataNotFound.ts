import { IDetail } from '../Interfaces'

export class DataNotFound extends Error {
  public constructor (public code: string = '001', public message: string = 'Item not found.', public details: IDetail[] = []) {
    super()
  }
}
