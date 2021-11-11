import { BadRequest } from '.'

export class RedisManyRecordsFoundException extends BadRequest {
  constructor(filter: string) {
    super(`Many records found with filter ${filter}, try to filter more specifically.`)
  }
}
