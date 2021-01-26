import { IItemListModel } from '../../Domain/Interfaces/IItemListModel'
import { FiltersDefault } from '../../Domain/Interfaces/IFiltersDefault'
import { ObjectID } from 'typeorm'

export interface IRepository<TDomainEntity> {
  /**
   * Retorna uma lista de registros pelos filtros do domínio.
   *
   * @template TDomainEntity
   *
   * @param {FiltersDefault} filters
   *
   * @returns {Promise<IItemListModel<TDomainEntity>>}
   */
  getAll(filters: FiltersDefault): Promise<IItemListModel<TDomainEntity>>

  /**
   * Retorna uma lista de registros.
   *
   * @template TDomainEntity
   *
   * @param {{}} options
   *
   * @returns {Promise<TDomainEntity[]>}
   */
  findAll (options: {}): Promise<TDomainEntity[]>

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
   * Cria/Atualiza um registro com base na entidade.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} entity
   *
   * @returns {Promise<TDomainEntity>}
   */
  createOrUpdate (entity: TDomainEntity): Promise<TDomainEntity>

  /**
   * Exclui um registro.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} criteria
   *
   * @returns {Promise<TDomainEntity>}
   */
  delete (criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[]): Promise<boolean>

  /**
   * Atualiza um registro.
   *
   * @template TDomainEntity
   *
   * @param {TDomainEntity} entity
   * @param {string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[]} conditions
   *
   * @returns {Promise<TDomainEntity>}
   */
  update (entity: TDomainEntity, conditions?: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[]): Promise<TDomainEntity>
}
