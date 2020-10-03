export interface IContext {
  userRoleType: RoleTypeRequest
  userId?: string
  userEmail?: string
}

export enum RoleTypeRequest {
  MANAGER = 'MANAGER',
  GUEST = 'GUEST',
  PUBLIC = 'PUBLIC',
  SYSTEM = 'SYSTEM'
}
