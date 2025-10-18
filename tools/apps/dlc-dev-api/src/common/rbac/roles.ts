/**
 * Role-Based Access Control (RBAC) Roles
 * Version: 1.2.3
 */

export enum UserRole {
  USER = 'user',
  TRANSLATOR = 'translator',
  REVIEWER = 'reviewer',
  ADMIN = 'admin',
  DEVOPS = 'devops',
}

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.USER]: [UserRole.USER],
  [UserRole.TRANSLATOR]: [UserRole.USER, UserRole.TRANSLATOR],
  [UserRole.REVIEWER]: [UserRole.USER, UserRole.TRANSLATOR, UserRole.REVIEWER],
  [UserRole.ADMIN]: [UserRole.USER, UserRole.TRANSLATOR, UserRole.REVIEWER, UserRole.ADMIN],
  [UserRole.DEVOPS]: [UserRole.USER, UserRole.TRANSLATOR, UserRole.REVIEWER, UserRole.ADMIN, UserRole.DEVOPS],
};

/**
 * Check if a user role has permission for a required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole]?.includes(requiredRole) ?? false;
}
