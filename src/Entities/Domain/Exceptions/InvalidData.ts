import { IDetail } from '../Interfaces'

export class InvalidData extends Error {
  public constructor (public code: string, public message: string, public details: IDetail[] = []) {
    super()
  }
}
