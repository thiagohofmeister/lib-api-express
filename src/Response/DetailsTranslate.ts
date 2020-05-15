import camelCase from 'camelcase'

export class DetailsTranslate {

  /**
   * Returns translated details with default messages and detail code.
   *
   * @param fields string[]
   *
   * @return IDetail[]
   */
  public static getDetails (fields: string[]): IDetail[] {
    const details = []
    for (let i in fields) {
      details.push(DetailsTranslate.getDetail(fields[i]))
    }

    return details
  }

  /**
   * Returns generated detail to the field.
   *
   * @param field string
   *
   * @return IDetail
   */
  public static getDetail (field: string): IDetail {

    const errorType = DetailsTranslate.getDetailType(field)
    const fieldsError = field.replace(`_${errorType.code}`, '').split('.')

    for (const i in fieldsError) {
      fieldsError[i] = camelCase(fieldsError[i])
    }

    const fields = fieldsError.join('.')

    const message = DetailsTranslate
      .getMessageByDetailType(errorType.code)
      .replace('$field', fields)

    return {
      id: `${fields}.${camelCase(errorType.label)}`,
      message: message
    }
  }

  /**
   * Returns the detail message by detail type.
   *
   * @param detailTypeLabel DetailType
   *
   * @return string
   */
  private static getMessageByDetailType (detailTypeLabel: string): string {
    return DetailTypeMessage[detailTypeLabel] || DetailTypeMessage['REGEXP']
  }

  /**
   * Returns detail type.
   *
   * @param field string
   *
   * @return DetailType
   */
  private static getDetailType (field: string): DetailType {
    const code: string = field.split('_')[field.split('_').length - 1]

    let label = DetailTypeLabel[code]
    if (DetailTypeLabel[code] === undefined) {
      label = DetailTypeLabel['REGEXP']
    }

    return {
      code,
      label
    }
  }
}

export interface DetailType {
  code: string
  label: DetailTypeLabel
}

export enum DetailTypeLabel {
  UNIQUE = 'UNIQUE',
  REGEXP = 'INVALID',
  REQUIRED = 'REQUIRED',
  NOTFOUND = 'NOTFOUND',
  HASASSOCIATION = 'HASASSOCIATION'
}

enum DetailTypeMessage {
  UNIQUE = 'Field $field must be unique.',
  REGEXP = 'Field $field is invalid.',
  REQUIRED = 'Field $field is required.',
  NOTFOUND = 'Field $field is not found.',
  HASASSOCIATION = 'Field $field has a association.'
}

export interface IDetail {
  id: string
  message: string
}
