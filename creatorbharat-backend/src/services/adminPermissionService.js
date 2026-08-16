// 🛡️ CreatorBharat SaaS Admin Permission & RBAC Service

export const ADMIN_ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  MANAGER: 'MANAGER',
  MODERATOR: 'MODERATOR',
  FINANCE: 'FINANCE',
  SUPPORT: 'SUPPORT'
};

export const ADMIN_PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  MANAGE_CREATORS: 'MANAGE_CREATORS',
  REVIEW_KYC: 'REVIEW_KYC',
  MANAGE_BRANDS: 'MANAGE_BRANDS',
  MANAGE_CAMPAIGNS: 'MANAGE_CAMPAIGNS',
  MODERATE_CONTENT: 'MODERATE_CONTENT',
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_PAYMENTS: 'VIEW_PAYMENTS',
  OVERRIDE_PAYMENTS: 'OVERRIDE_PAYMENTS',
  MANAGE_TEAM: 'MANAGE_TEAM',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  VIEW_DIAGNOSTICS: 'VIEW_DIAGNOSTICS'
};

export const ROLE_PERMISSIONS_MAP = {
  [ADMIN_ROLES.SUPERADMIN]: Object.values(ADMIN_PERMISSIONS),
  [ADMIN_ROLES.MANAGER]: [
    ADMIN_PERMISSIONS.VIEW_DASHBOARD,
    ADMIN_PERMISSIONS.MANAGE_CREATORS,
    ADMIN_PERMISSIONS.REVIEW_KYC,
    ADMIN_PERMISSIONS.MANAGE_BRANDS,
    ADMIN_PERMISSIONS.MANAGE_CAMPAIGNS,
    ADMIN_PERMISSIONS.MODERATE_CONTENT,
    ADMIN_PERMISSIONS.MANAGE_USERS,
    ADMIN_PERMISSIONS.VIEW_PAYMENTS,
    ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS,
    ADMIN_PERMISSIONS.VIEW_DIAGNOSTICS
  ],
  [ADMIN_ROLES.MODERATOR]: [
    ADMIN_PERMISSIONS.VIEW_DASHBOARD,
    ADMIN_PERMISSIONS.MANAGE_CREATORS,
    ADMIN_PERMISSIONS.REVIEW_KYC,
    ADMIN_PERMISSIONS.MANAGE_CAMPAIGNS,
    ADMIN_PERMISSIONS.MODERATE_CONTENT,
    ADMIN_PERMISSIONS.MANAGE_USERS
  ],
  [ADMIN_ROLES.FINANCE]: [
    ADMIN_PERMISSIONS.VIEW_DASHBOARD,
    ADMIN_PERMISSIONS.VIEW_PAYMENTS,
    ADMIN_PERMISSIONS.VIEW_AUDIT_LOGS
  ],
  [ADMIN_ROLES.SUPPORT]: [
    ADMIN_PERMISSIONS.VIEW_DASHBOARD,
    ADMIN_PERMISSIONS.MANAGE_CREATORS,
    ADMIN_PERMISSIONS.MANAGE_USERS
  ]
};

export const DANGEROUS_ACTIONS = [
  'USER_SUSPEND',
  'USER_UNSUSPEND',
  'CREATOR_DELETE',
  'CAMPAIGN_DELETE',
  'KYC_REJECT',
  'TEAM_ROLE_UPDATE',
  'TEAM_MEMBER_REVOKE',
  'PAYMENT_ESCROW_RELEASE',
  'PAYMENT_ESCROW_REFUND',
  'PLATFORM_SETTINGS_UPDATE'
];

export class AdminPermissionService {
  /**
   * Checks whether a team member role possesses a specific permission.
   *
   * @param {string} role - The team role (e.g. 'SUPERADMIN', 'MODERATOR')
   * @param {string} permission - The permission key to check
   * @returns {boolean}
   */
  static hasPermission(role, permission) {
    if (!role || !permission) return false;
    const allowed = ROLE_PERMISSIONS_MAP[role] || [];
    return allowed.includes(permission);
  }

  /**
   * Checks if an action is classified as a dangerous/destructive operation.
   *
   * @param {string} action
   * @returns {boolean}
   */
  static isDangerousAction(action) {
    return DANGEROUS_ACTIONS.includes(action);
  }

  /**
   * Returns list of permissions granted to a given role.
   *
   * @param {string} role
   * @returns {string[]}
   */
  static getPermissionsForRole(role) {
    return ROLE_PERMISSIONS_MAP[role] || [];
  }
}
