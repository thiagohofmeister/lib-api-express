import { IItemListModel } from './IItemListModel'
import { FiltersDefault } from './IFiltersDefault'

export interface IRepository<TDomainEntity> {
  /**
   * Retorna uma lista de registros.
   *
   * @template TDomainEntity
   *
   * @param {FiltersDefault} filters
   *
   * @returns {Promise<IItemListModel<TDomainEntity>>}
   */
  getAll(filters: FiltersDefault): Promise<IItemListModel<TDomainEntity>>

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
}
