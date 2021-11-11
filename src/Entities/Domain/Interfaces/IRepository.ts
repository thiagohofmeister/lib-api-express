import { IItemListModel } from './IItemListModel'

export interface IRepository<TDomainEntity> {
  /**
   * Retorna uma lista de registros com total e items.
   *
   * @template TDomainEntity
   *
   * @param {FiltersDefault} filters
   *
   * @returns {Promise<IItemListModel<TDomainEntity>>}
   */
  getAll<TFilter = any>(filter?: TFilter): Promise<IItemListModel<TDomainEntity>>

  /**
   * Retorna uma lista de registros sem paginação.
   *
   * @template TDomainEntity
   *
   * @param {FiltersDefault} filters
   *
   * @returns {Promise<TDomainEntity[]>}
   */
  findAll<TFilter = any>(filter?: TFilter): Promise<TDomainEntity[]>

  /**
   * Retorna um único registro filtrando pelo id.
   *
   * @template TDomainEntity
   *
   * @param {string} id
   *
   * @returns {Promise<TDomainEntity>}
   */
  getOneById(id: string): Promise<TDomainEntity>

  /**
   * Exclui um único registro filtrando pelo id.
   *
   * @template TDomainEntity
   *
   * @param {{} | string} id
   *
   * @returns {Promise<boolean>}
   */
  delete(id: {} | string): Promise<boolean>

  /**
   * Cria um registro com base na entidade.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} entity
   *
   * @returns {Promise<TDomainEntity>}
   */
  create(entity: TDomainEntity): Promise<TDomainEntity>

  /**
   * Cria ou atualiza um registro com base na entidade.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} entity
   *
   * @returns {Promise<TDomainEntity>}
   */
  save(entity: TDomainEntity): Promise<TDomainEntity>

  /**
   * Cria ou atualiza um registro com base na entidade.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} entity
   * @param {{} | string} conditions
   *
   * @returns {Promise<void>}
   */
  createOrUpdate(entity: TDomainEntity, conditions?: {} | string): Promise<void>

  /**
   * Atualiza um registro com base na entidade.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} entity
   * @param {{} | string} conditions
   *
   * @returns {Promise<TDomainEntity>}
   */
  update(entity: TDomainEntity, conditions?: {} | string): Promise<TDomainEntity | boolean>
}
