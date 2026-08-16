# CreatorBharat — Security Audit Log Specification (Phase 0 Preparation)

This specification defines the audit logging schema, security events, and logging contracts for all administrative and security-sensitive operations across CreatorBharat SaaS.

---

## 1. Audit Log Event Schema

Every security-sensitive action must produce an immutable audit log record with the following structure:

```typescript
interface AuditLogEntry {
  id: string;                      // Unique CUID / UUID
  actorId: string;                 // User ID performing the action
  actorEmail: string;              // Email of the actor at time of action
  actorRole: 'SUPERADMIN' | 'MANAGER' | 'MODERATOR' | 'FINANCE' | 'SUPPORT' | 'SYSTEM';
  action: string;                  // Standardized Action Code (e.g., 'PAYMENT_ESCROW_RELEASE')
  category: 'AUTH' | 'FINANCIAL' | 'RBAC' | 'USER_MANAGEMENT' | 'SYSTEM_CONFIG' | 'DATA_EXPORT';
  targetType: 'USER' | 'CREATOR' | 'BRAND' | 'CAMPAIGN' | 'PAYMENT' | 'SETTINGS' | 'SYSTEM';
  targetId: string;                // ID of entity affected
  timestamp: string;               // ISO 8601 UTC timestamp
  previousValue: Record<string, any> | null; // Pre-mutation snapshot (sanitized)
  newValue: Record<string, any> | null;      // Post-mutation snapshot (sanitized)
  ipAddress: string;               // Client IP address (from trusted proxy headers)
  userAgent: string;               // Client User-Agent string
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  metadata?: Record<string, any>;  // Extra contextual information (non-sensitive)
}
```

---

## 2. Inventory of Security-Sensitive Actions to be Logged

| Action Code | Category | Required Role | Description |
|---|---|---|---|
| `ADMIN_LOGIN_SUCCESS` | AUTH | ALL ADMINS | Admin authenticated into panel |
| `ADMIN_LOGIN_FAILURE` | AUTH | - | Failed admin login attempt |
| `ADMIN_CREDENTIAL_CHANGE` | AUTH | SUPERADMIN | Admin changed password or email |
| `TEAM_INVITE_CREATE` | RBAC | SUPERADMIN | Generated team member invitation token |
| `TEAM_INVITE_REVOKE` | RBAC | SUPERADMIN | Revoked pending team invitation |
| `TEAM_ROLE_UPDATE` | RBAC | SUPERADMIN | Altered team member role permissions |
| `TEAM_MEMBER_REVOKE` | RBAC | SUPERADMIN | Revoked admin privileges / demoted to creator |
| `USER_SUSPEND` | USER_MANAGEMENT | SUPERADMIN, MANAGER | Suspended user account |
| `USER_UNSUSPEND` | USER_MANAGEMENT | SUPERADMIN, MANAGER | Reactivated suspended user account |
| `CREATOR_PROFILE_ADMIN_EDIT`| USER_MANAGEMENT | SUPERADMIN, MANAGER | Admin edited creator details/verification |
| `CREATOR_KYC_APPROVE` | USER_MANAGEMENT | SUPERADMIN, MANAGER | Approved creator identity verification |
| `CREATOR_KYC_REJECT` | USER_MANAGEMENT | SUPERADMIN, MANAGER | Rejected creator identity verification |
| `CAMPAIGN_ADMIN_DELETE` | USER_MANAGEMENT | SUPERADMIN, MANAGER | Deleted campaign deal violating T&C |
| `PAYMENT_ESCROW_RELEASE` | FINANCIAL | SUPERADMIN | Manually released escrow to creator |
| `PAYMENT_ESCROW_REFUND` | FINANCIAL | SUPERADMIN | Manually refunded escrow to brand |
| `PLATFORM_SETTINGS_UPDATE` | SYSTEM_CONFIG | SUPERADMIN, MANAGER | Modified commission rates or features |
| `PANEL_SETTINGS_UPDATE` | SYSTEM_CONFIG | SUPERADMIN | Modified admin panel security parameters |
| `SYSTEM_BACKUP_EXPORT` | DATA_EXPORT | SUPERADMIN | Downloaded database snapshot backup |
| `SYSTEM_DIAGNOSTICS_VIEW` | SYSTEM_CONFIG | SUPERADMIN, MANAGER | Viewed system health diagnostics |

---

## 3. Data Sanitization & Compliance Rules

1. **Zero Secret Leakage:** Passwords, password hashes, 2FA secrets, JWTs, and API keys must NEVER appear in `previousValue`, `newValue`, or `metadata`.
2. **KYC Masking:** Aadhaar numbers, PAN numbers, and document URLs must be redacted (e.g. `XXXX-XXXX-1234`).
3. **Immutability:** Audit log storage must be write-only/append-only. No admin (including SUPERADMIN) should be able to edit or delete audit trail records.
4. **Retention:** Logs must be retained for a minimum of 365 days for compliance and forensic auditing.
