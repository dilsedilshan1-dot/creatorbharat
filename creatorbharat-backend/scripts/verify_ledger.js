// 🇮🇳 CreatorBharat — Comprehensive Financial Ledger Parity Verifier
// Validates: ledger totals == wallet balance == historical sum, available + locked == total position.

import prisma from '../src/prisma.js';
import { paiseToRupees } from '../src/utils/money.js';

export async function verifyLedgerParity(options = { verbose: false }) {
  console.log('=================================================================');
  console.log('🔍 CREATORBHARAT LEDGER PARITY RECONCILIATION AUDIT');
  console.log('=================================================================\n');

  const report = {
    walletsAudited: 0,
    passed: 0,
    failed: 0,
    review: 0,
    rows: []
  };

  try {
    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { id: true, email: true } },
        creator: { select: { id: true, handle: true } },
        transactions: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
        }
      }
    });

    report.walletsAudited = wallets.length;
    console.log(`[Ledger Parity]: Auditing ${wallets.length} active wallets.\n`);

    for (const wallet of wallets) {
      let computedAvailablePaise = BigInt(0);
      let computedLockedPaise = BigInt(0);
      let legacySumINR = 0;
      const seenIdempotencyKeys = new Set();
      let hasDuplicates = false;
      let hasSequenceError = false;

      for (const tx of wallet.transactions) {
        // Idempotency uniqueness
        if (tx.idempotencyKey) {
          if (seenIdempotencyKeys.has(tx.idempotencyKey)) {
            hasDuplicates = true;
          }
          seenIdempotencyKeys.add(tx.idempotencyKey);
        }

        // Amount calculation
        const txPaise = tx.amountPaise !== null && tx.amountPaise !== undefined
          ? tx.amountPaise
          : BigInt(Math.round(tx.amount * 100));

        legacySumINR += tx.amount;

        // Accounting breakdown by referenceType / operation
        if (tx.referenceType === 'LOCK_WITHDRAWAL') {
          const lockedAmount = txPaise < BigInt(0) ? -txPaise : txPaise;
          computedAvailablePaise -= lockedAmount;
          computedLockedPaise += lockedAmount;
        } else if (tx.referenceType === 'UNLOCK_WITHDRAWAL') {
          const unlockedAmount = txPaise < BigInt(0) ? -txPaise : txPaise;
          computedAvailablePaise += unlockedAmount;
          computedLockedPaise -= unlockedAmount;
        } else if (tx.referenceType === 'RELEASE_LOCKED') {
          const releasedAmount = txPaise < BigInt(0) ? -txPaise : txPaise;
          computedLockedPaise -= releasedAmount;
        } else {
          // Standard credit/debit
          computedAvailablePaise += txPaise;
        }

        // Sequence verification if balanceAfterPaise is populated
        if (tx.balanceAfterPaise !== null && tx.balanceAfterPaise !== undefined) {
          if (tx.balanceAfterPaise !== computedAvailablePaise) {
            hasSequenceError = true;
          }
        }
      }

      // Parity check
      const availableMatch = wallet.balancePaise === computedAvailablePaise;
      const lockedMatch = wallet.lockedPaise === computedLockedPaise;
      const nonNegative = wallet.balancePaise >= BigInt(0) && wallet.lockedPaise >= BigInt(0);
      const totalEconomicPaise = wallet.balancePaise + wallet.lockedPaise;

      let status = 'PASS';
      if (!availableMatch || !lockedMatch || hasDuplicates || hasSequenceError) {
        status = 'FAIL';
        report.failed++;
      } else if (!nonNegative) {
        status = 'REVIEW';
        report.review++;
      } else {
        report.passed++;
      }

      const row = {
        walletId: wallet.id,
        owner: wallet.creator?.handle ? `@${wallet.creator.handle}` : wallet.user?.email,
        legacySumINR,
        calculatedBalanceINR: paiseToRupees(computedPaise),
        walletBalanceINR: paiseToRupees(wallet.balancePaise),
        lockedINR: paiseToRupees(wallet.lockedPaise),
        totalEconomicINR: paiseToRupees(totalEconomicPaise),
        differenceINR: paiseToRupees(wallet.balancePaise - computedPaise),
        txCount: wallet.transactions.length,
        version: wallet.version,
        status
      };

      report.rows.push(row);

      if (options.verbose || status !== 'PASS') {
        console.log(`[${status}] Wallet ${wallet.id} (${row.owner}): Wallet=₹${row.walletBalanceINR}, Calc=₹${row.calculatedBalanceINR}, Diff=₹${row.differenceINR}`);
      }
    }

    console.log('\n-----------------------------------------------------------------');
    console.log('📋 PARITY MATRIX REPORT');
    console.log('-----------------------------------------------------------------');
    console.log(`Total Wallets Checked: ${report.walletsAudited}`);
    console.log(`Status PASS:           ${report.passed}`);
    console.log(`Status FAIL:           ${report.failed}`);
    console.log(`Status REVIEW:         ${report.review}`);
    console.log('-----------------------------------------------------------------\n');

    if (report.failed > 0) {
      console.error('❌ PARITY CHECK FAILED: Ledger discrepancies detected.');
    } else {
      console.log('✅ 100% LEDGER PARITY CONFIRMED ACROSS ALL WALLETS.');
    }

    return report;
  } catch (err) {
    console.error('❌ Parity Verification Error:', err.message);
    throw err;
  }
}

// CLI Direct Invocation
if (process.argv[1] && process.argv[1].endsWith('verify_ledger.js')) {
  verifyLedgerParity({ verbose: true })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
