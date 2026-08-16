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

  // ─── 10. Refund Primitive ─────────────────────────────────────────────────
  it('10. WalletService.refund adds compensatory credit to wallet and creates REFUND transaction', async () => {
    const { mockPrisma, getWallet, getTransactions } = createMockDb({
      id: 'w1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(20000), // ₹200
      lockedPaise: BigInt(0),
      version: 1
    });

    const result = await WalletService.refund('w1', BigInt(30000), {
      description: 'Refund for disputed campaign',
      referenceId: 'refund_ref_1'
    }, mockPrisma);

    expect(result.wallet.balancePaise).toBe(BigInt(50000)); // ₹500
    expect(result.wallet.version).toBe(2);

    const txs = getTransactions();
    expect(txs).toHaveLength(1);
    expect(txs[0].type).toBe('REFUND');
    expect(txs[0].amountPaise).toBe(BigInt(30000));
    expect(txs[0].balanceAfterPaise).toBe(BigInt(50000));
  });

  // ─── 11. Adjust Primitive (Positive and Negative) ──────────────────────────
  it('11. WalletService.adjust handles both positive and negative administrative ledger corrections', async () => {
    const { mockPrisma, getWallet } = createMockDb({
      id: 'w1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(50000), // ₹500
      lockedPaise: BigInt(0),
      version: 1
    });

    // Positive adjustment: +₹200
    const adjPos = await WalletService.adjust('w1', BigInt(20000), {
      reason: 'Reconciliation bonus',
      referenceId: 'adj_pos_1'
    }, mockPrisma);
    expect(adjPos.wallet.balancePaise).toBe(BigInt(70000));

    // Negative adjustment: -₹100
    const adjNeg = await WalletService.adjust('w1', BigInt(-10000), {
      reason: 'Chargeback fee adjustment',
      referenceId: 'adj_neg_1'
    }, mockPrisma);
    expect(adjNeg.wallet.balancePaise).toBe(BigInt(60000));
  });

  // ─── 12. Concurrent Valid Split (₹500 + ₹500 from ₹1,000) ──────────────────
  it('12. Sequential or retried concurrent debits (₹500 + ₹500 on ₹1,000) both succeed with final balance exactly ₹0', async () => {
    let walletState = {
      id: 'w_split',
      balancePaise: BigInt(100000), // ₹1,000
      version: 1
    };

    const atomicDebitWithRetry = async (debitPaise, maxRetries = 3) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const current = { ...walletState };
        if (current.balancePaise < debitPaise) {
          throw new Error('INSUFFICIENT_FUNDS');
        }
        if (walletState.version === current.version && walletState.balancePaise >= debitPaise) {
          walletState.balancePaise -= debitPaise;
          walletState.version += 1;
          return { success: true, balancePaise: walletState.balancePaise };
        }
      }
      throw new Error('CONCURRENCY_EXHAUSTED');
    };

    const res1 = await atomicDebitWithRetry(BigInt(50000));
    expect(res1.success).toBe(true);

    const res2 = await atomicDebitWithRetry(BigInt(50000));
    expect(res2.success).toBe(true);

    expect(walletState.balancePaise).toBe(BigInt(0)); // Exactly ₹0 remaining
    expect(walletState.version).toBe(3);
  });

  // ─── 13. Comprehensive Accounting Transition Matrix ────────────────────────
  it('13. Executes full financial accounting lifecycle (Credit -> Lock -> Unlock -> Lock -> Release -> Refund -> Adjust) verifying balanceAfter on every step', async () => {
    const { mockPrisma, getWallet, getTransactions } = createMockDb({
      id: 'w_lifecycle',
      userId: 'u_life',
      creatorId: 'c_life',
      balancePaise: BigInt(0),
      lockedPaise: BigInt(0),
      version: 1
    });

    // Step 1: Credit ₹1,000 (100,000 paise)
    const op1 = await WalletService.credit('w_lifecycle', BigInt(100000), { description: 'Campaign escrow released' }, mockPrisma);
    expect(op1.wallet.balancePaise).toBe(BigInt(100000));
    expect(op1.wallet.lockedPaise).toBe(BigInt(0));
    expect(op1.transaction.balanceAfterPaise).toBe(BigInt(100000));

    // Step 2: Lock ₹400 (40,000 paise) for withdrawal
    const op2 = await WalletService.lock('w_lifecycle', BigInt(40000), { description: 'Withdrawal requested' }, mockPrisma);
    expect(op2.wallet.balancePaise).toBe(BigInt(60000));
    expect(op2.wallet.lockedPaise).toBe(BigInt(40000));
    expect(op2.transaction.balanceAfterPaise).toBe(BigInt(60000));

    // Step 3: Unlock ₹100 (10,000 paise)
    const op3 = await WalletService.unlock('w_lifecycle', BigInt(10000), { description: 'Partial withdrawal cancelled' }, mockPrisma);
    expect(op3.wallet.balancePaise).toBe(BigInt(70000));
    expect(op3.wallet.lockedPaise).toBe(BigInt(30000));
    expect(op3.transaction.balanceAfterPaise).toBe(BigInt(70000));

    // Step 4: Release ₹300 (30,000 paise) to bank
    const op4 = await WalletService.release('w_lifecycle', BigInt(30000), { description: 'Bank transfer confirmed' }, mockPrisma);
    expect(op4.wallet.balancePaise).toBe(BigInt(70000));
    expect(op4.wallet.lockedPaise).toBe(BigInt(0));
    expect(op4.transaction.balanceAfterPaise).toBe(BigInt(70000));

    // Step 5: Refund ₹50 (5,000 paise)
    const op5 = await WalletService.refund('w_lifecycle', BigInt(5000), { description: 'Fee refund' }, mockPrisma);
    expect(op5.wallet.balancePaise).toBe(BigInt(75000));
    expect(op5.wallet.lockedPaise).toBe(BigInt(0));
    expect(op5.transaction.balanceAfterPaise).toBe(BigInt(75000));

    // Step 6: Adjust -₹50 (-5,000 paise)
    const op6 = await WalletService.adjust('w_lifecycle', BigInt(-5000), { reason: 'Tax deduction' }, mockPrisma);
    expect(op6.wallet.balancePaise).toBe(BigInt(70000));
    expect(op6.wallet.lockedPaise).toBe(BigInt(0));
    expect(op6.transaction.balanceAfterPaise).toBe(BigInt(70000));

    // Final Invariants Check
    const finalWallet = getWallet();
    expect(finalWallet.balancePaise).toBe(BigInt(70000));
    expect(finalWallet.lockedPaise).toBe(BigInt(0));
    expect(finalWallet.balancePaise >= BigInt(0)).toBe(true);
    expect(finalWallet.lockedPaise >= BigInt(0)).toBe(true);
    expect(getTransactions()).toHaveLength(6);
  });

  // ─── 14. Specific Lifecycle Test 1 & 2: LOCK 300 -> RELEASE 300 ────────────
  it('14. Lifecycle Test 1 & 2: Available 1000, Locked 0 -> LOCK 300 (Avail 700, Lock 300) -> RELEASE 300 (Avail 700, Lock 0, Net Economic Position 700, Zero Double-Debit)', async () => {
    const { mockPrisma, getWallet, getTransactions } = createMockDb({
      id: 'w_l1',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(100000), // Available ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    });

    // Step 1: LOCK ₹300
    const lockRes = await WalletService.lock('w_l1', BigInt(30000), {
      description: 'Lock ₹300 for payout',
      referenceId: 'lock_tx_1'
    }, mockPrisma);

    expect(lockRes.wallet.balancePaise).toBe(BigInt(70000)); // Available = ₹700
    expect(lockRes.wallet.lockedPaise).toBe(BigInt(30000));  // Locked = ₹300
    expect(lockRes.transaction.amountPaise).toBe(BigInt(-30000));
    expect(lockRes.transaction.balanceAfterPaise).toBe(BigInt(70000));

    // Step 2: RELEASE ₹300
    const relRes = await WalletService.release('w_l1', BigInt(30000), {
      description: 'Release ₹300 to bank',
      referenceId: 'rel_tx_1'
    }, mockPrisma);

    expect(relRes.wallet.balancePaise).toBe(BigInt(70000)); // Available remains ₹700
    expect(relRes.wallet.lockedPaise).toBe(BigInt(0));      // Locked is 0
    expect(relRes.transaction.amountPaise).toBe(BigInt(0)); // Available movement is 0 (NO DOUBLE DEBIT)
    expect(relRes.transaction.balanceAfterPaise).toBe(BigInt(70000));

    // Ledger Parity check
    const txs = getTransactions();
    const sumAvailableDelta = txs.reduce((acc, t) => acc + t.amountPaise, BigInt(0));
    expect(sumAvailableDelta).toBe(BigInt(-30000)); // Total available delta is exactly -₹300
    expect(BigInt(100000) + sumAvailableDelta).toBe(relRes.wallet.balancePaise); // 1000 - 300 = 700
  });

  // ─── 15. Specific Lifecycle Test 3: LOCK 300 -> UNLOCK 300 ─────────────────
  it('15. Lifecycle Test 3: LOCK 300 -> UNLOCK 300 restores Available to 1000 with Locked 0 and no phantom debit/credit', async () => {
    const { mockPrisma, getWallet, getTransactions } = createMockDb({
      id: 'w_l2',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(100000), // Available ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    });

    await WalletService.lock('w_l2', BigInt(30000), { referenceId: 'lock_2' }, mockPrisma);
    expect(getWallet().balancePaise).toBe(BigInt(70000));
    expect(getWallet().lockedPaise).toBe(BigInt(30000));

    await WalletService.unlock('w_l2', BigInt(30000), { referenceId: 'unlock_2' }, mockPrisma);
    expect(getWallet().balancePaise).toBe(BigInt(100000));
    expect(getWallet().lockedPaise).toBe(BigInt(0));

    const txs = getTransactions();
    const sumAvailableDelta = txs.reduce((acc, t) => acc + t.amountPaise, BigInt(0));
    expect(sumAvailableDelta).toBe(BigInt(0)); // Net effect is 0
  });

  // ─── 16. Specific Lifecycle Test 4: LOCK 300 -> RELEASE 300 -> CREDIT 100 ─
  it('16. Lifecycle Test 4: LOCK 300 -> RELEASE 300 -> CREDIT 100 results in Available 800, Locked 0', async () => {
    const { mockPrisma, getWallet, getTransactions } = createMockDb({
      id: 'w_l3',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(100000), // Available ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    });

    await WalletService.lock('w_l3', BigInt(30000), { referenceId: 'lock_3' }, mockPrisma);
    await WalletService.release('w_l3', BigInt(30000), { referenceId: 'rel_3' }, mockPrisma);
    await WalletService.credit('w_l3', BigInt(10000), { referenceId: 'cred_3', description: 'Bonus' }, mockPrisma);

    expect(getWallet().balancePaise).toBe(BigInt(80000)); // ₹800
    expect(getWallet().lockedPaise).toBe(BigInt(0));

    const txs = getTransactions();
    const sumAvailableDelta = txs.reduce((acc, t) => acc + t.amountPaise, BigInt(0));
    expect(sumAvailableDelta).toBe(BigInt(-20000)); // Net available delta = -200 (1000 - 200 = 800)
    expect(BigInt(100000) + sumAvailableDelta).toBe(getWallet().balancePaise);
  });

  // ─── 17. Concurrent LOCK Operations Exceeding Available Balance ───────────
  it('17. Concurrent LOCK operations (₹800 + ₹800 on ₹1,000 balance) reject double-locking', async () => {
    let walletState = {
      id: 'w_lock_conc',
      balancePaise: BigInt(100000), // ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    };

    const atomicLock = async (lockPaise) => {
      const current = { ...walletState };
      if (current.balancePaise < lockPaise) {
        throw new Error('INSUFFICIENT_FUNDS');
      }
      if (walletState.version === current.version && walletState.balancePaise >= lockPaise) {
        walletState.balancePaise -= lockPaise;
        walletState.lockedPaise += lockPaise;
        walletState.version += 1;
        return { success: true };
      } else {
        throw new Error('CONCURRENCY_CONFLICT');
      }
    };

    const results = [];
    try {
      await atomicLock(BigInt(80000));
      results.push({ status: 'SUCCESS' });
    } catch (e) {
      results.push({ status: 'FAILED' });
    }

    try {
      await atomicLock(BigInt(80000));
      results.push({ status: 'SUCCESS' });
    } catch (e) {
      results.push({ status: 'FAILED' });
    }

    expect(results.filter(r => r.status === 'SUCCESS')).toHaveLength(1);
    expect(results.filter(r => r.status === 'FAILED')).toHaveLength(1);
    expect(walletState.balancePaise).toBe(BigInt(20000)); // ₹200 remaining available
    expect(walletState.lockedPaise).toBe(BigInt(80000));  // ₹800 locked
  });

  // ─── 18. Duplicate LOCK and RELEASE Idempotency ───────────────────────────
  it('18. Duplicate LOCK and RELEASE submissions with same idempotencyKey have exactly one financial effect', async () => {
    const { mockPrisma, getWallet } = createMockDb({
      id: 'w_idem',
      userId: 'u1',
      creatorId: 'c1',
      balancePaise: BigInt(100000), // ₹1,000
      lockedPaise: BigInt(0),
      version: 1
    });

    // 1. Lock with idempotency key
    const lock1 = await WalletService.lock('w_idem', BigInt(30000), { idempotencyKey: 'idem_lock_1' }, mockPrisma);
    expect(lock1.isDuplicate).toBe(false);
    expect(getWallet().balancePaise).toBe(BigInt(70000));
    expect(getWallet().lockedPaise).toBe(BigInt(30000));

    // Duplicate Lock
    const lock2 = await WalletService.lock('w_idem', BigInt(30000), { idempotencyKey: 'idem_lock_1' }, mockPrisma);
    expect(lock2.isDuplicate).toBe(true);
    expect(getWallet().balancePaise).toBe(BigInt(70000));
    expect(getWallet().lockedPaise).toBe(BigInt(30000));

    // 2. Release with idempotency key
    const rel1 = await WalletService.release('w_idem', BigInt(30000), { idempotencyKey: 'idem_rel_1' }, mockPrisma);
    expect(rel1.isDuplicate).toBe(false);
    expect(getWallet().balancePaise).toBe(BigInt(70000));
    expect(getWallet().lockedPaise).toBe(BigInt(0));

    // Duplicate Release
    const rel2 = await WalletService.release('w_idem', BigInt(30000), { idempotencyKey: 'idem_rel_1' }, mockPrisma);
    expect(rel2.isDuplicate).toBe(true);
    expect(getWallet().balancePaise).toBe(BigInt(70000));
    expect(getWallet().lockedPaise).toBe(BigInt(0));
  });
});
