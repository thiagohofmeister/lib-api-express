import { IDetail } from '../Interfaces'

export class InvalidUserAuthenticationData extends Error {
  public constructor (public code: string = '001', public message: string = 'Invalid user authentication data', public details: IDetail[] = []) {
    super()
  }
}
