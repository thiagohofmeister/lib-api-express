import { FindManyOptions, MongoRepository } from 'typeorm'
import { FiltersDefault, IItemListModel, IRepository } from '../../Entities'
import { IEntityDataMapper } from '../../DataMappers'
import { DataNotFound } from '../../Entities'

export class TypeOrmMongoDBRepositoryContract<TDomainEntity, TDaoEntity> implements IRepository<TDomainEntity> {
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
   * @property {IEntityDataMapper<TDomainEntity, TDaoEntity>} dataMapper
   */
  protected readonly dataMapper: IEntityDataMapper<TDomainEntity, TDaoEntity>

  public constructor (
    repository: MongoRepository<TDaoEntity>,
    dataMapper: IEntityDataMapper<TDomainEntity, TDaoEntity>
  ) {
    this.repository = repository
    this.dataMapper = dataMapper
  }

  /**
   * @inheritDoc
   */
  public async getAll (filters: FiltersDefault): Promise<IItemListModel<TDomainEntity>> {
    const where = this.applyPaginator(filters, this.applySearch(filters, this.customToGetAll(filters, {})))

    return {
      total: await this.repository.count(where),
      items: (await this.repository.find(where)).map((e) => this.dataMapper.toDomain(e))
    }
  }

  /**
   * @inheritDoc
   */
  async findAll(options: FindManyOptions<TDaoEntity> | Partial<TDaoEntity>): Promise<TDomainEntity[]> {
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
      const result = await this.repository.save(this.repository.create(this.dataMapper.toDaoEntity(entity)))

      return this.dataMapper.toDomain(result)
    } catch (e) {
      return null
    }
  }

  /**
   * @inheritDoc
   */
  public async createOrUpdate (entity: TDomainEntity): Promise<TDomainEntity> {
    return this.create(entity)
  }

  /**
   * @inheritDoc
   */
  public async delete (id: string): Promise<boolean> {
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
  public async update (entity: TDomainEntity, conditions?: {} | string): Promise<TDomainEntity> {
    return this.create(entity)
  }

  /**
   * Aplica paginação na 'query'.
   *
   * @template TDaoEntity
   *
   * @param {FiltersDefault} filters
   * @param {FindManyOptions<TDaoEntity>} query
   *
   * @returns {FindManyOptions<TDaoEntity>}
   */
  public applyPaginator (filters: FiltersDefault, query: FindManyOptions<TDaoEntity>): FindManyOptions<TDaoEntity> {
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
   * @param {FiltersDefault} filters
   * @param {FindManyOptions<TDaoEntity>} query
   *
   * @returns {FindManyOptions<TDaoEntity>}
   */
  protected customToGetAll (filters: FiltersDefault, query: FindManyOptions<TDaoEntity>): FindManyOptions<TDaoEntity> {
    return query
  }

  /**
   * Aplica na 'query' as condições para o filtro de campo de busca.
   *
   * @template TDaoEntity
   *
   * @param {FiltersDefault} filters
   * @param {FindManyOptions<TDaoEntity>} query
   *
   * @returns {FindManyOptions<TDaoEntity>}
   */
  protected applySearch (filters: FiltersDefault, query: FindManyOptions<TDaoEntity>): FindManyOptions<TDaoEntity> {

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
