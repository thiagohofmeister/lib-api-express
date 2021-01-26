import { FindConditions, FindManyOptions, ObjectID, Repository as TypeOrmRepository } from 'typeorm'
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder'
import { IEntityDataMapper } from '../../DataMappers'
import { DataNotFound } from '../../Entities'
import { FiltersDefault, IItemListModel, IRepository } from '../../Entities'

export class TypeOrmMysqlRepositoryContract<TDomainEntity, TDaoEntity> implements IRepository<TDomainEntity> {
  /**
   * Repositório do ORM.
   *
   * @template TDaoEntity
   *
   * @property {TypeOrmRepository<TDaoEntity>} repository
   */
  protected readonly repository: TypeOrmRepository<TDaoEntity>

  /**
   * Conversor dos dados entre banco de dados e domínio.
   *
   * @template TDomainEntity
   * @template TDaoEntity
   *
   * @property {IEntityDataMapper<TDomainEntity, TDaoEntity>} dataMapper
   */
  protected readonly dataMapper: IEntityDataMapper<TDomainEntity, TDaoEntity>

  public constructor (
    repository: TypeOrmRepository<TDaoEntity>,
    dataMapper: IEntityDataMapper<TDomainEntity, TDaoEntity>
  ) {
    this.repository = repository
    this.dataMapper = dataMapper
  }

  /**
   * @inheritDoc
   */
  public async getAll (filters: FiltersDefault): Promise<IItemListModel<TDomainEntity>> {
    const query = this.applyPaginator(filters, this.applySearch(filters, this.customToGetAll(filters, this.repository.createQueryBuilder())))

    return {
      total: await query.getCount(),
      items: (await query.getMany()).map((e) => this.dataMapper.toDomain(e))
    }
  }

  /**
   * @inheritDoc
   */
  public async findAll (options: FindManyOptions<TDaoEntity>): Promise<TDomainEntity[]> {
    return (await this.repository.find(options)).map(item => this.dataMapper.toDomain(item))
  }

  /**
   * @inheritDoc
   */
  public async getOneById (id: string): Promise<TDomainEntity> {
    const entity = await this.repository.findOne(id)

    if (!entity) {
      throw new DataNotFound()
    }

    return this.dataMapper.toDomain(entity)
  }

  /**
   * @inheritDoc
   */
  public async create (entity: TDomainEntity): Promise<TDomainEntity> {
    try {
      const result = await this.repository.save(this.dataMapper.toDaoEntity(entity))

      return this.dataMapper.toDomain(result)
    } catch (e) {
      return null
    }
  }

  /**
   * @inheritDoc
   */
  public async createOrUpdate (entity: TDomainEntity, conditions?: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TDaoEntity>): Promise<TDomainEntity> {
    return this.create(entity)
  }

  /**
   * @inheritDoc
   */
  public async delete (criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TDaoEntity>): Promise<boolean> {
    try {
      await this.repository.delete(criteria)

      return true
    } catch (e) {
      return false
    }
  }

  /**
   * @inheritDoc
   */
  public async update (entity: TDomainEntity, conditions?: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TDaoEntity>): Promise<TDomainEntity> {
    return this.create(entity)
  }

  /**
   * Aplica paginação na 'query'.
   *
   * @template TDaoEntity
   *
   * @param {FiltersDefault} filters
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  public applyPaginator (filters: FiltersDefault, query: SelectQueryBuilder<TDaoEntity>): SelectQueryBuilder<TDaoEntity> {
    const skip = (this.getPage(filters) - 1) * this.getSize(filters)
    const size = this.getSize(filters)

    return query.skip(skip).take(size)
  }

  /**
   * Permite aplicar modificações na 'query' do método getAll().
   *
   * @template TDaoEntity
   *
   * @param {FiltersDefault} filters
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  protected customToGetAll (filters: FiltersDefault, query: SelectQueryBuilder<TDaoEntity>): SelectQueryBuilder<TDaoEntity> {
    return query
  }

  /**
   * Aplica na 'query' as condições para o filtro de campo de busca.
   *
   * @template TDaoEntity
   *
   * @param {FiltersDefault} filters
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  protected applySearch (filters: FiltersDefault, query: SelectQueryBuilder<TDaoEntity>): SelectQueryBuilder<TDaoEntity> {

    if (!filters.query) {
      return query
    }

    const fieldsToWhere = []
    for (const field of this.getFieldsToSearch(filters)) {
      fieldsToWhere.push(`${field} like '%${filters.query}%'`)
    }

    if (fieldsToWhere.length) {
      query.andWhere(`(${fieldsToWhere.join(' OR ')})`)
    }

    return query
  }

  /**
   * Retorna a página para a query.
   *
   * @param {FiltersDefault} filters
   *
   * @returns {string[]}
   */
  protected getFieldsToSearch (filters: FiltersDefault): string[] {
    return []
  }

  /**
   * Retorna a página para a query.
   *
   * @param {FiltersDefault} filters
   */
  protected getPage (filters: FiltersDefault) {
    filters.page = typeof filters.page === 'string' ? parseInt(filters.page) : filters.page

    let page = 1
    if (filters.page > 0) {
      page = typeof filters.page === 'string' ? parseInt(filters.page) : filters.page
    }

    return page
  }

  /**
   * Retorna a quantidade de itens para a query.
   *
   * @param {FiltersDefault} filters
   */
  protected getSize (filters: FiltersDefault) {
    filters.size = typeof filters.size === 'string' ? parseInt(filters.size) : filters.size

    let size = 15
    if (filters.size > 0) {
      size = filters.size
      if (filters.size > 100) {
        size = 100
      }
    }

    return size
  }
}
