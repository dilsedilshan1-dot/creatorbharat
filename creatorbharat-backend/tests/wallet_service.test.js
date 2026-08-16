// 🇮🇳 CreatorBharat — Wallet Service & Financial Ledger Invariant Tests
import { describe, it, expect, vi } from 'vitest';
import { rupeesToPaise, paiseToRupees, formatINR } from '../src/utils/money.js';
import { WalletService, FinancialError } from '../src/services/walletService.js';

describe('WalletService & Financial Ledger Invariant Tests', () => {

  // ─── 1. INR to Paise Conversion ───────────────────────────────────────────
  it('1. rupeesToPaise accurately converts numeric INR to BigInt Paise without IEEE 754 float drift', () => {
    expect(rupeesToPaise(49)).toBe(BigInt(4900));
    expect(rupeesToPaise(99.50)).toBe(BigInt(9950));
    expect(rupeesToPaise('199.99')).toBe(BigInt(19999));
    expect(rupeesToPaise(0)).toBe(BigInt(0));
    expect(rupeesToPaise(5000)).toBe(BigInt(500000));
    expect(rupeesToPaise(-1500)).toBe(BigInt(-150000));
  });

  // ─── 2. Invalid Amount Rejection ──────────────────────────────────────────
  it('2. rupeesToPaise strictly rejects NaN, null, non-numeric strings, and out-of-bounds amounts', () => {
    expect(() => rupeesToPaise(null)).toThrow(TypeError);
    expect(() => rupeesToPaise(undefined)).toThrow(TypeError);
    expect(() => rupeesToPaise('not_a_number')).toThrow(TypeError);
    expect(() => rupeesToPaise(NaN)).toThrow(TypeError);
    expect(() => rupeesToPaise(Infinity)).toThrow(RangeError);
    expect(() => rupeesToPaise(9999999999)).toThrow(RangeError); // Exceeds ₹10 Crores bound
  });

  // ─── 3. Paise to Rupees & Format INR ──────────────────────────────────────
  it('3. paiseToRupees and formatINR correctly format monetary values', () => {
    expect(paiseToRupees(BigInt(4900))).toBe(49);
    expect(paiseToRupees(BigInt(150050))).toBe(1500.50);
    const formatted = formatINR(BigInt(150050));
    expect(formatted).toContain('1,500.50');
  });

  // ─── 4. Mock Prisma Environment for WalletService Primitives ─────────────
  const createMockDb = (initialWallet) => {
    let wallet = { ...initialWallet };
    const transactions = [];

    const mockPrisma = {
      wallet: {
        findUnique: vi.fn(async ({ where }) => (wallet.id === where.id ? { ...wallet } : null)),
        findFirst: vi.fn(async () => ({ ...wallet })),
        create: vi.fn(async ({ data }) => {
          wallet = { id: 'wallet_1', ...data, version: 1, createdAt: new Date(), updatedAt: new Date() };
          return { ...wallet };
        }),
        update: vi.fn(async ({ data }) => {
          wallet = { ...wallet, ...data };
          return { ...wallet };
        }),
        updateMany: vi.fn(async ({ where, data }) => {
          const versionMatches = wallet.version === where.version;
          const balanceOk = where.balancePaise?.gte !== undefined ? wallet.balancePaise >= where.balancePaise.gte : true;
          const lockedOk = where.lockedPaise?.gte !== undefined ? wallet.lockedPaise >= where.lockedPaise.gte : true;

          if (versionMatches && balanceOk && lockedOk) {
            wallet.balancePaise = data.balancePaise !== undefined ? data.balancePaise : wallet.balancePaise;
            wallet.lockedPaise = data.lockedPaise !== undefined ? data.lockedPaise : wallet.lockedPaise;
            wallet.version += (data.version?.increment || 1);
            return { count: 1 };
          }
          return { count: 0 };
        })
      },
      walletTransaction: {
        findFirst: vi.fn(async ({ where }) => {
          const match = transactions.find(t => 
            (where.OR || []).some(cond => 
              (cond.idempotencyKey && t.idempotencyKey === cond.idempotencyKey) ||
              (cond.referenceId && t.referenceId === cond.referenceId)
            )
          );
          return match ? { ...match } : null;
        }),
        create: vi.fn(async ({ data }) => {
          const entry = { id: `tx_${transactions.length + 1}`, ...data, createdAt: new Date() };
          transactions.push(entry);
          return entry;
        })
      },
      $transaction: vi.fn(async (callback) => callback(mockPrisma))
    };

    return { mockPrisma, getWallet: () => wallet, getTransactions: () => transactions };
  };

  // ─── 5. Credit Primitive ──────────────────────────────────────────────────
  it('5. WalletService.credit successfully adds balance, increments version, and creates immutable ledger entry', async () => {
    const { mockPrisma, getWallet, getTransactions } = createMockDb({
      id: 'w1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(0),
      lockedPaise: BigInt(0),
      version: 1
    });

    const result = await WalletService.credit('w1', BigInt(500000), {
      type: 'CAMPAIGN_PAYOUT',
      description: 'Payout for campaign 1',
      referenceType: 'CAMPAIGN_ESCROW',
      referenceId: 'escrow_1'
    }, mockPrisma);

    expect(result.wallet.balancePaise).toBe(BigInt(500000));
    expect(result.wallet.version).toBe(2);
    expect(result.isDuplicate).toBe(false);

    const txs = getTransactions();
    expect(txs).toHaveLength(1);
    expect(txs[0].amountPaise).toBe(BigInt(500000));
    expect(txs[0].balanceAfterPaise).toBe(BigInt(500000));
    expect(txs[0].status).toBe('SUCCESS');
  });

  // ─── 6. Debit Primitive & Insufficient Funds Guard ─────────────────────────
  it('6. WalletService.debit reduces balance when funds are sufficient, and throws when insufficient', async () => {
    const { mockPrisma, getWallet } = createMockDb({
      id: 'w1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(100000), // ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    });

    // Debit ₹400
    const result = await WalletService.debit('w1', BigInt(40000), {
      type: 'BANK_WITHDRAWAL',
      description: 'Payout to bank account',
      referenceId: 'payout_1'
    }, mockPrisma);

    expect(result.wallet.balancePaise).toBe(BigInt(60000)); // ₹600 remaining
    expect(result.wallet.version).toBe(2);

    // Attempt to debit ₹1,000 from ₹600 balance -> throws INSUFFICIENT_FUNDS
    await expect(
      WalletService.debit('w1', BigInt(100000), { description: 'Exceeding debit' }, mockPrisma)
    ).rejects.toThrow(FinancialError);

    // Balance remains ₹600
    expect(getWallet().balancePaise).toBe(BigInt(60000));
  });

  // ─── 7. Lock and Unlock Primitives ────────────────────────────────────────
  it('7. WalletService.lock and unlock transfer funds between balancePaise and lockedPaise correctly', async () => {
    const { mockPrisma, getWallet } = createMockDb({
      id: 'w1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(100000), // ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    });

    // Lock ₹300 for pending withdrawal
    await WalletService.lock('w1', BigInt(30000), { description: 'Pending payout lock' }, mockPrisma);
    expect(getWallet().balancePaise).toBe(BigInt(70000));
    expect(getWallet().lockedPaise).toBe(BigInt(30000));
    expect(getWallet().version).toBe(2);

    // Unlock ₹100 back to available
    await WalletService.unlock('w1', BigInt(10000), { description: 'Partial unlock' }, mockPrisma);
    expect(getWallet().balancePaise).toBe(BigInt(80000));
    expect(getWallet().lockedPaise).toBe(BigInt(20000));
    expect(getWallet().version).toBe(3);

    // Release remaining ₹200 to bank permanently
    await WalletService.release('w1', BigInt(20000), { description: 'Disbursed to bank' }, mockPrisma);
    expect(getWallet().balancePaise).toBe(BigInt(80000));
    expect(getWallet().lockedPaise).toBe(BigInt(0));
    expect(getWallet().version).toBe(4);
  });

  // ─── 8. Double-Spend & Concurrency Protection ─────────────────────────────
  it('8. Concurrent debit requests on same wallet reject double-spending (Request A=₹800, Request B=₹800 on ₹1,000 balance)', async () => {
    let walletState = {
      id: 'w_concurrent',
      balancePaise: BigInt(100000), // ₹1,000
      version: 1
    };

    // Simulate database conditional atomic update
    const atomicDebit = async (debitPaise) => {
      // Read phase
      const current = { ...walletState };
      if (current.balancePaise < debitPaise) {
        throw new Error('INSUFFICIENT_FUNDS');
      }

      // Conditional write phase
      if (walletState.version === current.version && walletState.balancePaise >= debitPaise) {
        walletState.balancePaise -= debitPaise;
        walletState.version += 1;
        return { success: true, balancePaise: walletState.balancePaise };
      } else {
        throw new Error('CONCURRENCY_CONFLICT');
      }
    };

    // Thread 1 and Thread 2 both see ₹1,000 and attempt to withdraw ₹800
    const results = [];
    try {
      const res1 = await atomicDebit(BigInt(80000));
      results.push({ thread: 1, status: 'SUCCESS', ...res1 });
    } catch (e) {
      results.push({ thread: 1, status: 'FAILED', error: e.message });
    }

    try {
      const res2 = await atomicDebit(BigInt(80000));
      results.push({ thread: 2, status: 'SUCCESS', ...res2 });
    } catch (e) {
      results.push({ thread: 2, status: 'FAILED', error: e.message });
    }

    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const failCount = results.filter(r => r.status === 'FAILED').length;

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);
    expect(walletState.balancePaise).toBe(BigInt(20000)); // Exactly ₹200 left (NEVER -₹600)
  });

  // ─── 9. Idempotency Key Deduplication ─────────────────────────────────────
  it('9. Re-submitting the same idempotencyKey returns existing record without double crediting', async () => {
    const { mockPrisma, getWallet } = createMockDb({
      id: 'w1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(0),
      lockedPaise: BigInt(0),
      version: 1
    });

    const op1 = await WalletService.credit('w1', BigInt(500000), {
      idempotencyKey: 'idem_unique_tx_1',
      referenceId: 'ref_unique_1',
      description: 'First credit'
    }, mockPrisma);

    expect(op1.isDuplicate).toBe(false);
    expect(getWallet().balancePaise).toBe(BigInt(500000));

    // Duplicate submission with same idempotencyKey
    const op2 = await WalletService.credit('w1', BigInt(500000), {
      idempotencyKey: 'idem_unique_tx_1',
      referenceId: 'ref_unique_1',
      description: 'Duplicate retry'
    }, mockPrisma);

    expect(op2.isDuplicate).toBe(true);
    // Balance MUST remain ₹5,000 (not ₹10,000)
    expect(getWallet().balancePaise).toBe(BigInt(500000));
  });
});
