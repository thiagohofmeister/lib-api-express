import { Repository as TypeOrmRepository } from 'typeorm'
import { ObjectID } from 'typeorm/driver/mongodb/typings'
import { FindConditions } from 'typeorm/find-options/FindConditions'
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder'
import { EntityDataMapperContract } from '../..'
import { DataNotFound, IFilterDefault, IItemListModel, IRepository } from '../../Entities'

export class TypeOrmMysqlRepositoryContract<TDomainEntity, TDaoEntity>
  implements IRepository<TDomainEntity>
{
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
   * @property {EntityDataMapperContract<TDomainEntity, TDaoEntity>} dataMapper
   */
  protected readonly dataMapper: EntityDataMapperContract<TDomainEntity, TDaoEntity>

  public constructor(
    repository: TypeOrmRepository<TDaoEntity>,
    dataMapper: EntityDataMapperContract<TDomainEntity, TDaoEntity>,
    protected accountId: string | null,
    protected dataNotFoundException?: DataNotFound
  ) {
    this.repository = repository
    this.dataMapper = dataMapper

    if (!dataNotFoundException) this.dataNotFoundException = new DataNotFound()
  }

  /**
   * @inheritDoc
   */
  public async getAll<TFilter extends IFilterDefault>(
    filter: TFilter
  ): Promise<IItemListModel<TDomainEntity>> {
    const query = this.applyPaginator(
      filter,
      this.applySearch(filter, this.customToGetAll(filter, this.repository.createQueryBuilder()))
    )

    return {
      total: await query.getCount(),
      items: this.dataMapper.toDomainMany(await query.getMany())
    }
  }

  /**
   * @inheritDoc
   */
  public async findAll<TFilter extends IFilterDefault>(filter: TFilter): Promise<TDomainEntity[]> {
    const query = this.applySearch(
      filter,
      this.customToGetAll(filter, this.repository.createQueryBuilder())
    )

    return this.dataMapper.toDomainMany(await query.getMany())
  }

  /**
   * @inheritDoc
   */
  public async getOneById(id: string): Promise<TDomainEntity> {
    const query = this.customToGetOneById(
      this.repository.createQueryBuilder().andWhere(`${this.getTableName()}.id = :id`, { id })
    )

    const entity = await query.getOne()

    if (!entity) throw this.dataNotFoundException

    return this.dataMapper.toDomain(entity)
  }

  /**
   * @inheritDoc
   */
  public async create(entity: TDomainEntity): Promise<TDomainEntity> {
    return this.save(entity)
  }

  /**
   * @inheritDoc
   */
  public async save(entity: TDomainEntity): Promise<TDomainEntity> {
    const result = await this.repository.save(this.dataMapper.toDaoEntity(entity))

    return this.dataMapper.toDomain(result)
  }

  /**
   * @inheritDoc
   */
  public async createOrUpdate(
    entity: TDomainEntity,
    conditions?:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindConditions<TDaoEntity>
  ): Promise<void> {
    try {
      await this.repository.insert(this.dataMapper.toDaoEntity(entity))
    } catch (e) {
      await this.repository.update(conditions, this.dataMapper.toDaoEntity(entity))
    }
  }

  /**
   * @inheritDoc
   */
  public async delete(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindConditions<TDaoEntity>
  ): Promise<boolean> {
    await this.repository.delete(criteria)

    return true
  }

  /**
   * @inheritDoc
   */
  public async update(
    entity: TDomainEntity,
    conditions?:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | ObjectID
      | ObjectID[]
      | FindConditions<TDaoEntity>
  ): Promise<any> {
    const result = await this.repository.update(conditions, this.dataMapper.toDaoEntity(entity))

    return !!result.affected
  }

  /**
   * Aplica paginação na 'query'.
   *
   * @template TDaoEntity
   *
   * @param {IFilterDefault} filter
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  public applyPaginator(
    filter: IFilterDefault,
    query: SelectQueryBuilder<TDaoEntity>
  ): SelectQueryBuilder<TDaoEntity> {
    const skip = (this.getPage(filter) - 1) * this.getSize(filter)
    const size = this.getSize(filter)

    return query.skip(skip).take(size)
  }

  /**
   * Permite aplicar modificações na 'query' do método getAll().
   *
   * @template TDaoEntity
   *
   * @param {IFilterDefault} filter
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  protected customToGetAll(
    filter: IFilterDefault,
    query: SelectQueryBuilder<TDaoEntity>
  ): SelectQueryBuilder<TDaoEntity> {
    return query
  }

  /**
   * Permite aplicar modificações na 'query' do método getOneById().
   *
   * @template TDaoEntity
   *
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  protected customToGetOneById(
    query: SelectQueryBuilder<TDaoEntity>
  ): SelectQueryBuilder<TDaoEntity> {
    return query
  }

  /**
   * Aplica na 'query' as condições para o filtro de campo de busca.
   *
   * @template TDaoEntity
   *
   * @param {IFilterDefault} filter
   * @param {SelectQueryBuilder<TDaoEntity>} query
   *
   * @returns {SelectQueryBuilder<TDaoEntity>}
   */
  protected applySearch(
    filter: IFilterDefault,
    query: SelectQueryBuilder<TDaoEntity>
  ): SelectQueryBuilder<TDaoEntity> {
    if (!filter.query || !this.getFieldsToSearch().length) return query

    const fieldsToWhere = []
    for (const field of this.getFieldsToSearch()) {
      fieldsToWhere.push(`${field} like '%${filter.query}%'`)
    }

    query.andWhere(`(${fieldsToWhere.join(' OR ')})`)

    return query
  }

  /**
   * Retorna a página para a query.
   *
   * @returns {string[]}
   */
  protected getFieldsToSearch(): string[] {
    return []
  }

  /**
   * Retorna a página para a query.
   *
   * @param {IFilterDefault} filter
   */
  protected getPage(filter: IFilterDefault) {
    filter.page = typeof filter.page === 'string' ? parseInt(filter.page) : filter.page

    let page = 1
    if (filter.page > 0) {
      page = typeof filter.page === 'string' ? parseInt(filter.page) : filter.page
    }

    return page
  }

  /**
   * Retorna a quantidade de itens para a query.
   *
   * @param {IFilterDefault} filter
   */
  protected getSize(filter: IFilterDefault) {
    filter.size = typeof filter.size === 'string' ? parseInt(filter.size) : filter.size

    let size = 15
    if (filter.size > 0) {
      size = filter.size
      if (filter.size > 100) {
        size = 100
      }
    }

    return size
  }

  protected hasColumn(columnName: string): boolean {
    return this.repository.metadata.columns.map(column => column.propertyName).includes(columnName)
  }

  protected hasRelation(propertyName: string): boolean {
    return this.repository.metadata.relations
      .map(relation => relation.propertyName)
      .includes(propertyName)
  }

  protected getTableName(): string {
    return this.repository.metadata.targetName
  }
}
