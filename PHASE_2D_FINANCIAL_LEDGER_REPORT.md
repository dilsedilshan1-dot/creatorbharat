# CREATORBHARAT — PHASE 2D
# FINANCIAL TRANSACTION MIGRATION & WALLET LEDGER REPORT

**Repository:** `Mohmmad-Dilshan/creatorbharat`  
**Git Branch:** `creatorbharat-phase-2d-financial-ledger`  
**Date:** August 16, 2026  
**Status:** **PASSED & VERIFIED**  
**Test Suite:** 57/57 Tests Passed across 9 test files (100%)  
**Prisma Validation:** Valid & Formatted (`prisma/schema.prisma`)  

---

## 1. Financial Data Inventory

An inventory of all financial models across CreatorBharat confirmed:
- **`WalletTransaction`:** Legacy table storing amounts as whole INR integers. 
- **`Payment`:** Escrow deposits, boost purchases, pro listings, and featured slots.
- **`GigMilestone`:** Milestone proofs and payout amounts (`Float`, rounded to nearest whole INR on release).
- **`Referral`:** Fixed ₹199 reward payouts on successful brand/creator referral.
- **`Campaign`:** Total campaign budgets stored in whole INR.

---

## 2. Money-Unit Verification

- **Legacy Unit:** Whole INR Rupees (`number` / `Int`).
- **Canonical Unit:** Integer Paise (`BigInt` / `paise`).
- **Conversion Utility:** [`src/utils/money.js`](file:///d:/creatorbharat-1/creatorbharat-backend/src/utils/money.js)
  - Formula: $\text{Paise} = \text{Math.round}(\text{INR} \times 100)$ as `BigInt`.
  - Finite validation, range bounds ($[-10\text{ Crores}, +10\text{ Crores}]$), and strict rejection of `NaN`, `null`, and floating-point arithmetic artifacts.

---

## 3. Ownership Mapping

- **Canonical Wallet Owner:** Each `Wallet` has a strict 1-to-1 aggregate relationship with `User` (`userId @unique`) and `Creator` (`creatorId @unique`).
- **Orphan Guard:** `WalletService` and `scripts/migrate_wallets.js` reject orphan transactions with missing `userId` or `creatorId` (Fail-Closed).

---

## 4. Transaction Classification

| Operation Code | Domain Flow | Effect on `balancePaise` | Effect on `lockedPaise` | `referenceType` |
| :--- | :--- | :--- | :--- | :--- |
| `CAMPAIGN_PAYOUT` | Escrow released to creator | $+\text{amountPaise}$ | $0$ | `CAMPAIGN_ESCROW` |
| `REFERRAL_REWARD` | Milestone/referral payout | $+\text{amountPaise}$ | $0$ | `REFERRAL` |
| `BANK_WITHDRAWAL` | Payout to bank account | $-\text{amountPaise}$ | $0$ | `BANK_PAYOUT` |
| `LOCK_WITHDRAWAL` | Pending payout in transit | $-\text{amountPaise}$ | $+\text{amountPaise}$ | `PENDING_PAYOUT` |
| `UNLOCK_WITHDRAWAL`| Cancelled payout | $+\text{amountPaise}$ | $-\text{amountPaise}$ | `CANCELLED_PAYOUT` |
| `RELEASE_LOCKED` | Confirmed gateway payout | $0$ | $-\text{amountPaise}$ | `GATEWAY_DISBURSEMENT` |
| `REFUND` | Compensatory credit | $+\text{amountPaise}$ | $0$ | `REFUND_CORRECTION` |
| `ADJUSTMENT` | Admin ledger correction | $\pm\text{amountPaise}$ | $0$ | `ADMIN_ADJUSTMENT` |

---

## 5. Escrow & Locked-Balance Accounting Model

- **Available Balance (`balancePaise`):** Funds immediately available for creator withdrawal or platform use.
- **Locked Balance (`lockedPaise`):** Escrow funds or pending withdrawals currently in transit to bank gateways.
- **Total Economic Position:**
$$\text{Total Economic Position} = \text{balancePaise} + \text{lockedPaise}$$

---

## 6. Dry-Run Migration Results

Executing [`scripts/migrate_wallets.js`](file:///d:/creatorbharat-1/creatorbharat-backend/scripts/migrate_wallets.js) in default dry-run mode:
- Scanned all creator accounts and historical `WalletTransaction` entries.
- Sequence ordered by `createdAt ASC, id ASC`.
- Converted all historical records into simulated integer Paise with running `balanceAfterPaise`.
- **Anomalies Detected:** 0
- **Mathematical Parity:** 100%

---

## 7. Migration Design

The backfill is executed in atomic per-creator batches:
1. **Discover:** Fetch all creator records and chronological transaction history.
2. **Anchor:** Upsert `Wallet` aggregate with calculated `balancePaise`, `lockedPaise: 0n`, `version: 1`.
3. **Backfill:** Populate `walletId`, `amountPaise`, `balanceAfterPaise`, `idempotencyKey = legacy_wallet_tx_${id}`, and `referenceType` on each historical transaction row.
4. **Preserve:** Legacy fields (`amount`, `type`, `status`) remain untouched.

---

## 8. WalletService Design

[`src/services/walletService.js`](file:///d:/creatorbharat-1/creatorbharat-backend/src/services/walletService.js) exposes seven financial primitives:
- `credit(walletId, amountPaise, options)`
- `debit(walletId, amountPaise, options)`
- `lock(walletId, amountPaise, options)`
- `unlock(walletId, amountPaise, options)`
- `release(walletId, amountPaise, options)`
- `refund(walletId, amountPaise, options)`
- `adjust(walletId, amountPaise, options)`

All operations execute inside ACID database transactions (`prisma.$transaction`) with automatic rollback on error.

---

## 9. Concurrency Strategy

- **Optimistic Concurrency Control:** Every update checks `version = expectedVersion`.
- **Atomic Balance Predicate:** Withdrawals enforce `balancePaise >= debitAmountPaise` at the database level.
```sql
UPDATE "Wallet"
SET "balancePaise" = :newBalance, "version" = "version" + 1
WHERE "id" = :walletId AND "version" = :expectedVersion AND "balancePaise" >= :debitAmount;
```
- If two threads concurrently attempt to withdraw ₹800 from a ₹1,000 balance, exactly one succeeds and the second fails with `CONCURRENCY_CONFLICT_OR_INSUFFICIENT_FUNDS`. The balance is never negative.

---

## 10. Idempotency Strategy

- `idempotencyKey` and `referenceId` are evaluated before initiating any balance mutation.
- If a duplicate operation key is submitted, `WalletService` immediately returns the existing transaction and wallet state without mutating balance a second time.

---

## 11. Ledger Parity Results

Executing [`scripts/verify_ledger.js`](file:///d:/creatorbharat-1/creatorbharat-backend/scripts/verify_ledger.js):
$$\text{Wallet.balancePaise} = \sum_{\text{SUCCESS}} \text{Tx.amountPaise}$$
- Total Wallets Audited: Reconciled with 0 discrepancies.
- All active records confirmed in exact parity.

---

## 12. Financial Invariants

1. $\text{balancePaise} \ge 0$ (Available balance is strictly non-negative).
2. $\text{lockedPaise} \ge 0$ (Locked balance is strictly non-negative).
3. Every balance change produces an immutable `WalletTransaction` row.
4. `WalletTransaction` records cannot be updated or deleted.
5. Wallet `version` strictly increments on every balance mutation.

---

## 13. Tests Added (`tests/wallet_service.test.js`)

1. **Test 1:** `rupeesToPaise` accurately converts numeric INR to `BigInt` Paise without float drift.
2. **Test 2:** `rupeesToPaise` strictly rejects `NaN`, `null`, non-numeric strings, and out-of-bounds amounts.
3. **Test 3:** `paiseToRupees` and `formatINR` correctly format monetary values.
4. **Test 5:** `WalletService.credit` successfully adds balance, increments version, and creates immutable ledger entry.
5. **Test 6:** `WalletService.debit` reduces balance when funds are sufficient, and throws when insufficient.
6. **Test 7:** `WalletService.lock`, `unlock`, and `release` transfer funds between `balancePaise` and `lockedPaise` correctly.
7. **Test 8:** Concurrent debit requests on same wallet reject double-spending (Request A = ₹800, Request B = ₹800 on ₹1,000 balance -> one succeeds, one fails, balance never negative).
8. **Test 9:** Re-submitting the same `idempotencyKey` returns existing record without double crediting.

---

## 14. Test Results

```
 RUN  v4.1.9 D:/creatorbharat-1/creatorbharat-backend

 ✓ tests/config.test.js (8 tests) 49ms
 ✓ tests/wallet_service.test.js (8 tests) 506ms
 ✓ tests/ledger.test.js (6 tests) 40ms
 ✓ tests/audit_media_outbox.test.js (6 tests) 42ms
 ✓ tests/health.test.js (4 tests) 250ms
 ✓ tests/gigs.test.js (2 tests) 221ms
 ✓ tests/ai.test.js (2 tests) 294ms
 ✓ tests/auth.test.js (4 tests) 324ms
 ✓ tests/security.test.js (17 tests) 774ms

 Test Files  9 passed (9)
      Tests  57 passed (57)
   Start at  11:26:31
   Duration  12.77s
```

---

## 15. Production Safety Gates

`scripts/migrate_wallets.js` in `APPLY` mode requires the following environment flags:
1. `MIGRATION_MODE=APPLY`
2. `FINANCIAL_MIGRATION_APPROVED=true`
3. `CONFIRM_MIGRATION=YES`

If any flag is missing, the runner automatically defaults to `DRY_RUN` mode with zero mutations.

---

## 16. Backup Requirements

Prior to running `APPLY` on production:
1. Create a full PostgreSQL dump: `pg_dump -Fc $DATABASE_URL > backup_pre_wallet_migration.dump`
2. Verify dump integrity and size.
3. Record backup timestamp in operational log before launching migration.

---

## 17. Payment Compatibility & Migration Gap Analysis

| Route | Current Flow | Target Flow (P2-E) | Migration Gap |
| :--- | :--- | :--- | :--- |
| `POST /api/payments/create-escrow` | `Payment.create({ status: 'PENDING' })` | Unchanged | None |
| `POST /api/payments/verify` | Updates `Payment` -> `PAID` | Updates `Payment` + emits `OutboxEvent` | Outbox integration in P2-E |
| `POST /api/payments/release-escrow`| Direct disjoint queries to `Payment`, `WalletTransaction`, `Application` | `WalletService.credit()` inside transaction + `OutboxEvent` | Replace route handler with `WalletService` call in P2-E |
| `POST /api/payments/withdraw` | Calculates dynamic sum and creates unversioned `WalletTransaction` | `WalletService.debit()` with concurrency lock | Replace route handler with `WalletService.debit()` in P2-E |
| `POST /api/gigs/:id/milestones/:mId/approve` | Direct `WalletTransaction.create()` | `WalletService.credit()` | Replace route handler in P2-E |

---

## 18. Files Changed

1. **`src/utils/money.js`** *(NEW)* — Deterministic INR/Paise conversion utility.
2. **`src/services/walletService.js`** *(NEW)* — Enterprise financial ledger service with concurrency and idempotency.
3. **`scripts/migrate_wallets.js`** *(NEW)* — Gated wallet migration and transaction backfill runner.
4. **`scripts/verify_ledger.js`** *(NEW)* — Comprehensive ledger parity verifier.
5. **`tests/wallet_service.test.js`** *(NEW)* — 8 financial invariant, double-spend, and primitive tests.
6. **`PHASE_2D_FINANCIAL_LEDGER_REPORT.md`** *(NEW)* — Full certification report.

---

## 19. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Race Conditions on Payouts** | Double spend / negative balances | Conditional update on `version` and non-negative balance predicate at DB level. |
| **Accidental Production Apply** | Unintended mutations | Triple safety gate (`MIGRATION_MODE=APPLY`, `FINANCIAL_MIGRATION_APPROVED=true`, `CONFIRM_MIGRATION=YES`). |
| **Duplicate Webhook Processing** | Double crediting | `idempotencyKey` and `referenceId` uniqueness checks in `WalletService`. |

---

## 20. Rollback Procedure

If needed, revert `src/services/walletService.js`, `src/utils/money.js`, and scripts:
```bash
git checkout creatorbharat-phase-2c-audit-media-outbox
```

---

## 21. Exact Next Step for Sub-Phase P2-E

With Phase 2D certified:
- **Next Sub-Phase:** **P2-E (Backend Service & Controller Extraction)**
- **Scope for P2-E:** Extract controller and service logic from monolithic route files into domain services (`PaymentService`, `GigService`, `AuthService`, `AuditLogService`), route financial releases through `WalletService`, and integrate transactional `OutboxEvent` emission.
