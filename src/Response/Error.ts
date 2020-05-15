import { IDetail } from './DetailsTranslate'

export class DataNotFound extends Error {
  public constructor (public code: string = '001', public message: string = 'Item not found.', public details: IDetail[] = []) {
    super()
  }
}

export class AlreadyExists extends Error {
  public constructor (public code: string, public message: string, public details: IDetail[] = []) {
    super()
  }
}

export class InvalidData extends Error {
  public constructor (public code: string, public message: string, public details: IDetail[] = []) {
    super()
  }
}

export class InvalidUserAuthenticationData extends Error {
  public constructor (public code: string = '001', public message: string = 'Invalid user authentication data', public details: IDetail[] = []) {
    super()
  }
}

export class NotAllowed extends Error {
  public constructor (public code: string = '001', public message: string = 'You are not allowed to it.', public details: IDetail[] = []) {
    super()
  }
}
