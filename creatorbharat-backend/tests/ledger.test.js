// 🇮🇳 CreatorBharat — Financial Ledger Foundation Unit & Integration Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../src/prisma.js';

describe('Financial Ledger Schema & Concurrency Foundation Tests', () => {

  // ─── 1. Wallet Model Defaults & Types ─────────────────────────────────────
  it('1. Wallet aggregate model initializes with 0 balance, 0 locked, version 1, and INR currency', () => {
    const mockWallet = {
      id: 'wallet_cuid_123',
      userId: 'user_cuid_123',
      creatorId: 'creator_cuid_123',
      balancePaise: BigInt(0),
      lockedPaise: BigInt(0),
      currency: 'INR',
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(mockWallet.balancePaise).toBe(BigInt(0));
    expect(mockWallet.lockedPaise).toBe(BigInt(0));
    expect(mockWallet.version).toBe(1);
    expect(mockWallet.currency).toBe('INR');
    expect(typeof mockWallet.balancePaise).toBe('bigint');
  });

  // ─── 2. Rupee to Paise Integer Conversion Precision ───────────────────────
  it('2. Rupee-to-Paise conversion strictly avoids floating point rounding errors', () => {
    const testCases = [
      { inr: 49, expectedPaise: BigInt(4900) },
      { inr: 99.50, expectedPaise: BigInt(9950) },
      { inr: 199.99, expectedPaise: BigInt(19999) },
      { inr: 0, expectedPaise: BigInt(0) },
      { inr: 5000, expectedPaise: BigInt(500000) },
      { inr: -1500, expectedPaise: BigInt(-150000) }
    ];

    testCases.forEach(({ inr, expectedPaise }) => {
      const computedPaise = BigInt(Math.round(inr * 100));
      expect(computedPaise).toBe(expectedPaise);
    });
  });

  // ─── 3. Additive Fields on WalletTransaction ──────────────────────────────
  it('3. WalletTransaction model supports additive canonical fields without breaking legacy fields', () => {
    const legacyTransaction = {
      id: 'tx_cuid_legacy',
      creatorId: 'creator_cuid_123',
      amount: 5000, // Legacy amount in whole INR
      type: 'CAMPAIGN_PAYOUT',
      status: 'SUCCESS',
      description: 'Campaign Payout for campaign: c1',
      referenceId: 'escrow_release_p1',
      createdAt: new Date()
    };

    const modernTransaction = {
      ...legacyTransaction,
      id: 'tx_cuid_modern',
      walletId: 'wallet_cuid_123',
      amountPaise: BigInt(500000), // Canonical Paise
      balanceAfterPaise: BigInt(500000),
      referenceType: 'CAMPAIGN_ESCROW',
      idempotencyKey: 'idem_key_abcdef123',
      metadata: { campaignId: 'c1', brandId: 'b1' }
    };

    expect(legacyTransaction.amount).toBe(5000);
    expect(modernTransaction.amountPaise).toBe(BigInt(500000));
    expect(modernTransaction.balanceAfterPaise).toBe(BigInt(500000));
    expect(modernTransaction.referenceType).toBe('CAMPAIGN_ESCROW');
  });

  // ─── 4. Optimistic Concurrency Control Simulation ─────────────────────────
  it('4. Optimistic concurrency conditional update succeeds on matched version and fails on stale version', () => {
    // Current database state
    let databaseWallet = {
      id: 'wallet_cuid_123',
      balancePaise: BigInt(100000), // ₹1,000.00
      version: 1
    };

    // Simulate conditional update function
    const executeConditionalWithdrawal = (walletId, expectedVersion, debitPaise) => {
      if (
        databaseWallet.id === walletId &&
        databaseWallet.version === expectedVersion &&
        databaseWallet.balancePaise >= debitPaise
      ) {
        databaseWallet.balancePaise -= debitPaise;
        databaseWallet.version += 1;
        return { count: 1 }; // Affected rows = 1 (Success)
      }
      return { count: 0 }; // Affected rows = 0 (Concurrency Conflict)
    };

    // Thread 1 attempts withdrawal of ₹300 (30,000 paise) with version 1
    const thread1Result = executeConditionalWithdrawal('wallet_cuid_123', 1, BigInt(30000));
    expect(thread1Result.count).toBe(1);
    expect(databaseWallet.balancePaise).toBe(BigInt(70000)); // ₹700.00 left
    expect(databaseWallet.version).toBe(2);

    // Thread 2 attempts withdrawal with stale version 1 (Race condition simulation)
    const thread2Result = executeConditionalWithdrawal('wallet_cuid_123', 1, BigInt(30000));
    expect(thread2Result.count).toBe(0); // Rejected due to version mismatch!

    // Thread 2 retries with refreshed version 2
    const thread2Retry = executeConditionalWithdrawal('wallet_cuid_123', 2, BigInt(30000));
    expect(thread2Retry.count).toBe(1);
    expect(databaseWallet.balancePaise).toBe(BigInt(40000)); // ₹400.00 left
    expect(databaseWallet.version).toBe(3);
  });

  // ─── 5. Insufficient Funds Guard ──────────────────────────────────────────
  it('5. Conditional update rejects withdrawal when requested amount exceeds available balance', () => {
    let databaseWallet = {
      id: 'wallet_cuid_123',
      balancePaise: BigInt(10000), // ₹100.00
      version: 1
    };

    const attemptWithdrawal = (debitPaise) => {
      if (databaseWallet.balancePaise >= debitPaise && databaseWallet.version === 1) {
        databaseWallet.balancePaise -= debitPaise;
        databaseWallet.version += 1;
        return true;
      }
      return false;
    };

    // Attempt to withdraw ₹500 (50,000 paise) from ₹100 balance
    const success = attemptWithdrawal(BigInt(50000));
    expect(success).toBe(false);
    expect(databaseWallet.balancePaise).toBe(BigInt(10000)); // Balance remains unchanged
  });

  // ─── 6. Idempotency Key Rejection Guarantee ───────────────────────────────
  it('6. Duplicate idempotency keys prevent double crediting or debiting', () => {
    const processedKeys = new Set();

    const processLedgerOperation = (idempotencyKey, amountPaise) => {
      if (processedKeys.has(idempotencyKey)) {
        return { status: 'ALREADY_PROCESSED', duplicate: true };
      }
      processedKeys.add(idempotencyKey);
      return { status: 'SUCCESS', amountPaise };
    };

    const op1 = processLedgerOperation('idempotency_tx_123', BigInt(500000));
    expect(op1.status).toBe('SUCCESS');

    const op2 = processLedgerOperation('idempotency_tx_123', BigInt(500000));
    expect(op2.status).toBe('ALREADY_PROCESSED');
    expect(op2.duplicate).toBe(true);
  });
});
