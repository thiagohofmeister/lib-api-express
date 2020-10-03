import { IContext, RoleTypeRequest } from '../../Handlers/Interfaces'

export class ValidateRoleContext {
  protected context: IContext

  constructor (context: IContext) {
    this.context = context
  }

  /**
   * Retorna se a role do contexto está contida nas roles enviadas.
   *
   * @param {RoleTypeRequest | RoleTypeRequest[]} roles
   */
  protected validateRole (roles: RoleTypeRequest | RoleTypeRequest[]): boolean {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }

    return roles.some(role => role === this.context.userRoleType)
  }
}