export interface IEntityDataMapper<Domain, Entity> {
  /**
   * Converte uma entidade do banco de dados para uma entidade do domínio.
   *
   * @template Entity
   *
   * @param {Entity} entity
   *
   * @returns {Domain}
   */
  toDomain(entity: Entity): Domain

  /**
   * Converte uma entidade do domínio para uma entidade do banco de dados.
   *
   * @template Entity
   *
   * @param {Domain} domain
   *
   * @returns {Entity}
   */
  toDaoEntity(domain: Domain): Entity
}
