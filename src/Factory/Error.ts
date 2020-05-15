import { AlreadyExists, DataNotFound, DetailsTranslate, DetailTypeLabel, IDetail, InvalidData } from '../Response'
import camelCase from 'camelcase'

export class ErrorFactory {

  public static getFromSequelizeError (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {

      const model = camelCase(error.errors[0].instance.constructor.name)
      const uniqueFields = Object.keys(error.fields).map(key => `${model}.${key}`)

      let detailsTranslated: IDetail[] = DetailsTranslate.getDetails(uniqueFields)

      return new AlreadyExists('001', 'An entity with the data already exists.', detailsTranslated)

    } else if (error.name === 'SequelizeForeignKeyConstraintError') {

      const model = error.table

      let detailType = DetailTypeLabel.NOTFOUND
      if (error.original.code === 'ER_ROW_IS_REFERENCED_2') {
        detailType = DetailTypeLabel.HASASSOCIATION
      }

      const uniqueFields = error.fields.map(key => `${model}.${key}_${detailType}`)

      let detailsTranslated: IDetail[] = DetailsTranslate.getDetails(uniqueFields)

      if (detailType === DetailTypeLabel.HASASSOCIATION) {
        return new InvalidData('001', 'Invalid data.', detailsTranslated)
      }

      return new DataNotFound('001', 'Item not found.', detailsTranslated)
    }

    throw Error('Error name is not implemented.')
  }

  public static getUnprocessableEntityFromValidationError (error): InvalidData {
    const errorFields = Object.keys(error.errors).map(key => `${key}_${error.errors[key].kind.toUpperCase()}`)

    const detailsTranslated = DetailsTranslate.getDetails(errorFields)

    return new InvalidData('001', 'Invalid data.', detailsTranslated)
  }
}
