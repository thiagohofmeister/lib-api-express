import { Schema } from 'joi'
import { InvalidData } from '../../Entities/Domain/Exceptions'

export class JoiSchemaValidatorContract {

  /**
   * Valida um payload com base em um Schema.
   *
   * @template T
   *
   * @param {T} body
   * @param {Schema} schema
   */
  public async validateBySchema<T> (body: T, schema: Schema): Promise<void> {
    try {
      await schema.validateAsync(body, { abortEarly: false })
    } catch (e) {
      console.log(e)
      throw new InvalidData('001', 'Invalid data.', e.details.map(detail => ({
        id: `${detail.path.join('.')}.${detail.type}`,
        message: detail.message,
        enum: detail.context.valids
      })))
    }
  }
}