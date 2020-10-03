import { IDetail } from '../Interfaces'

export class NotAllowed extends Error {
  public constructor (public code: string = '001', public message: string = 'You are not allowed to it.', public details: IDetail[] = []) {
    super()
  }
}
