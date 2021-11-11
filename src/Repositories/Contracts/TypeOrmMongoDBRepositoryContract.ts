import { FindManyOptions, MongoRepository, ObjectLiteral } from 'typeorm'
import { EntityDataMapperContract, IFilterDefault } from '../..'
import { DataNotFound, IItemListModel, IRepository } from '../../Entities'

export class TypeOrmMongoDBRepositoryContract<TDomainEntity, TDaoEntity>
  implements IRepository<TDomainEntity>
{
  /**
   * Repositório do ORM.
   *
   * @template TDaoEntity
   *
   * @property {MongoRepository<TDaoEntity>} repository
   */
  protected readonly repository: MongoRepository<TDaoEntity>

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
    repository: MongoRepository<TDaoEntity>,
    dataMapper: EntityDataMapperContract<TDomainEntity, TDaoEntity>
  ) {
    this.repository = repository
    this.dataMapper = dataMapper
  }

  /**
   * @inheritDoc
   */
  public async getAll(filters: IFilterDefault): Promise<IItemListModel<TDomainEntity>> {
    const query = this.applyPaginator(
      filters,
      this.applySearch(filters, this.customToGetAll(filters, {}))
    )

    return {
      total: await this.repository.count(query.where as ObjectLiteral),
      items: (await this.repository.find(query)).map(e => this.dataMapper.toDomain(e))
    }
  }

  /**
   * @inheritDoc
   */
  public async getOneById(id: string): Promise<TDomainEntity> {
    const entity = await this.repository.findOne(id)

    if (!entity) {
      throw new DataNotFound()
    }

    return this.dataMapper.toDomain(entity)
  }

  /**
   * @inheritDoc
   */
  public async create(entity: TDomainEntity): Promise<TDomainEntity> {
    try {
      const result = await this.repository.save(
        this.repository.create(this.dataMapper.toDaoEntity(entity))
      )

      return this.dataMapper.toDomain(result)
    } catch (e) {
      return null
    }
  }

  /**
   * @inheritDoc
   */
  public async save(entity: TDomainEntity): Promise<TDomainEntity> {
    try {
      const result = await this.repository.save(
        this.repository.create(this.dataMapper.toDaoEntity(entity))
      )

      return this.dataMapper.toDomain(result)
    } catch (e) {
      return null
    }
  }

  /**
   * @inheritDoc
   */
  public async createOrUpdate(entity: TDomainEntity, conditions?: {} | string): Promise<void> {
    const result = await this.create(entity)

    if (!result) {
      await this.update(entity, conditions)
    }
  }

  /**
   * @inheritDoc
   */
  public async delete(id: string): Promise<boolean> {
    try {
      await this.repository.delete(id)

      return true
    } catch (e) {
      return false
    }
  }

  /**
   * @inheritDoc
   */
  public async update(entity: TDomainEntity, conditions?: {} | string): Promise<boolean> {
    try {
      const result = await this.repository.update(conditions, this.dataMapper.toDaoEntity(entity))

      return !!result.affected
    } catch (e) {
      return false
    }
  }

  /**
   * Aplica paginação na 'query'.
   *
   * @template TDaoEntity
   *
   * @param {IFilterDefault} filters
   * @param {FindManyOptions<TDaoEntity>} query
   *
   * @returns {FindManyOptions<TDaoEntity>}
   */
  public applyPaginator(
    filters: IFilterDefault,
    query: FindManyOptions<TDaoEntity>
  ): FindManyOptions<TDaoEntity> {
    const skip = (this.getPage(filters) - 1) * this.getSize(filters)
    const take = this.getSize(filters)

    query = {
      ...query,
      skip,
      take
    }

    return query
  }

  /**
   * Permite aplicar modificações na 'query' do método getAll().
   *
   * @template TDaoEntity
   *
   * @param {IFilterDefault} filters
   * @param {FindManyOptions<TDaoEntity>} query
   *
   * @returns {FindManyOptions<TDaoEntity>}
   */
  protected customToGetAll(
    filters: IFilterDefault,
    query: FindManyOptions<TDaoEntity>
  ): FindManyOptions<TDaoEntity> {
    return query
  }

  /**
   * Aplica na 'query' as condições para o filtro de campo de busca.
   *
   * @template TDaoEntity
   *
   * @param {IFilterDefault} filters
   * @param {FindManyOptions<TDaoEntity>} query
   *
   * @returns {FindManyOptions<TDaoEntity>}
   */
  protected applySearch(
    filters: IFilterDefault,
    query: FindManyOptions<TDaoEntity>
  ): FindManyOptions<TDaoEntity> {
    if (!filters.query) {
      return query
    }

    const fieldsToWhere = []
    for (const field of this.getFieldsToSearch(filters)) {
      const nameReg = new RegExp(filters.query, 'i')
      fieldsToWhere.push({ [field]: { $regex: nameReg } })
    }

    if (fieldsToWhere.length) {
      query.where['$or'] = fieldsToWhere
    }

    return query
  }

  /**
   * Retorna a página para a query.
   *
   * @param {IFilterDefault} filters
   *
   * @returns {string[]}
   */
  protected getFieldsToSearch(filters: IFilterDefault): string[] {
    return []
  }

  /**
   * Retorna a página para a query.
   *
   * @param {IFilterDefault} filters
   */
  protected getPage(filters: IFilterDefault) {
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
   * @param {IFilterDefault} filters
   */
  protected getSize(filters: IFilterDefault) {
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

  public async findAll(filters: IFilterDefault): Promise<TDomainEntity[]> {
    const query = this.applySearch(filters, this.customToGetAll(filters, {}))

    return (await this.repository.find(query)).map(e => this.dataMapper.toDomain(e))
  }
}
