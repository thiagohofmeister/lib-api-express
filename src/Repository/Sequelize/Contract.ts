import { IFindOptions, Sequelize } from 'sequelize-typescript'
import { ItemListModel } from '../../Model'
import { concat } from 'lodash'
import { FindOptions } from 'sequelize'
import { BaseRepositoryContract, FilterDefault } from '..'

export abstract class SequelizeRepositoryContract extends BaseRepositoryContract {

  protected async applySearchWithSequelize<T> (searchOptions: SearchOptions, findOptions: IFindOptions<T> | FindOptions<T>, filter: FilterDefault): Promise<ItemListModel<T>> {
    let conditions = searchOptions.fields.map(field => `${field.split('.').map(str => `\`${str}\``).join('.')} LIKE '%${filter.query}%'`)

    if (searchOptions.literals) {
      conditions = [
        ...conditions,
        ...searchOptions.literals
      ]
    }

    const query = Sequelize.literal(`(${conditions.join(` ${searchOptions.operator || SearchOperator.OR} `)})`)

    const options = Object.assign({
      ...findOptions,
      subQuery: false,
      group: `\`${searchOptions.model.name}.\`${searchOptions.modelKey}\``
    })

    if (options.hasOwnProperty('where')) {
      options.where.$and = concat(options.where.$and, query)
    } else {
      options.where = {
        $and: query
      }
    }

    const total = await searchOptions.model.count(options)

    this.applyPaginator(filter, options)

    // @ts-ignore
    findOptions.where = {
      [searchOptions.modelKey]: {
        $in: (await searchOptions.model.findAll(options)).map(item => item[searchOptions.modelKey])
      }
    }

    let items = await searchOptions.model.findAll(findOptions)

    if (searchOptions.rowToEntity) {
      items = items.map(item => searchOptions.rowToEntity(item))
    }

    return {
      items,
      total: total.length
    }
  }
}

export enum SearchOperator {
  OR = 'OR',
  AND = 'AND'
}

export interface SearchOptions {
  fields: string[]
  model: any
  modelKey: string
  rowToEntity?: (item: any) => any
  literals?: string[]
  operator?: SearchOperator
}
