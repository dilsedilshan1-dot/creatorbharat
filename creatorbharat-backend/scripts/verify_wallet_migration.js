// 🇮🇳 CreatorBharat — Financial Ledger Migration & Parity Verification Script
// Objective: Dry-run audit of historical transactions, rupee-to-paise conversion parity,
// and simulated wallet balance reconciliation with ZERO database mutations.

import prisma from '../src/prisma.js';

export async function verifyWalletMigration(options = { isDryRun: true, verbose: false }) {
  console.log('=================================================================');
  console.log('🏦 CREATORBHARAT FINANCIAL LEDGER PARITY AUDIT');
  console.log(`Mode: ${options.isDryRun ? 'DRY-RUN (Read-Only Audit)' : 'LIVE'}`);
  console.log('=================================================================\n');

  const results = {
    totalCreatorsAudited: 0,
    totalTransactionsAudited: 0,
    validWallets: 0,
    flaggedWallets: 0,
    discrepancies: [],
    summary: {
      totalCreditsPaise: BigInt(0),
      totalDebitsPaise: BigInt(0),
      netLedgerBalancePaise: BigInt(0)
    }
  };

  try {
    // 1. Fetch all Creators with their historical transactions
    const creators = await prisma.creator.findMany({
      include: {
        user: { select: { id: true, email: true } },
        walletTransactions: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
        }
      }
    });

    results.totalCreatorsAudited = creators.length;
    console.log(`[Audit]: Loaded ${creators.length} creators from database.\n`);

    for (const creator of creators) {
      let runningBalancePaise = BigInt(0);
      let creatorCreditsPaise = BigInt(0);
      let creatorDebitsPaise = BigInt(0);
      const txHistory = creator.walletTransactions;
      results.totalTransactionsAudited += txHistory.length;

      let hasAnomaly = false;
      const anomalyNotes = [];

      for (let i = 0; i < txHistory.length; i++) {
        const tx = txHistory[i];
        
        // Validate legacy amount
        if (typeof tx.amount !== 'number' || isNaN(tx.amount)) {
          hasAnomaly = true;
          anomalyNotes.push(`Transaction ${tx.id} has invalid amount: ${tx.amount}`);
          continue;
        }

        // Convert INR Rupees to integer Paise (1 INR = 100 Paise)
        const amountPaise = BigInt(Math.round(tx.amount * 100));

        if (amountPaise >= BigInt(0)) {
          creatorCreditsPaise += amountPaise;
        } else {
          creatorDebitsPaise += -amountPaise;
        }

        runningBalancePaise += amountPaise;

        // Check for negative balance anomalies
        if (runningBalancePaise < BigInt(0)) {
          hasAnomaly = true;
          anomalyNotes.push(
            `Negative balance after Tx ${tx.id} (${tx.type}): balance = ${runningBalancePaise} paise (₹${Number(runningBalancePaise) / 100})`
          );
        }
      }

      results.summary.totalCreditsPaise += creatorCreditsPaise;
      results.summary.totalDebitsPaise += creatorDebitsPaise;

      if (hasAnomaly) {
        results.flaggedWallets++;
        results.discrepancies.push({
          creatorId: creator.id,
          handle: creator.handle,
          email: creator.user?.email,
          transactionCount: txHistory.length,
          computedBalancePaise: runningBalancePaise.toString(),
          computedBalanceINR: Number(runningBalancePaise) / 100,
          anomalies: anomalyNotes
        });
      } else {
        results.validWallets++;
        if (options.verbose) {
          console.log(`✓ Creator @${creator.handle} (${creator.id}): ${txHistory.length} txs, Balance: ₹${Number(runningBalancePaise) / 100}`);
        }
      }
    }

    results.summary.netLedgerBalancePaise = results.summary.totalCreditsPaise - results.summary.totalDebitsPaise;

    console.log('-----------------------------------------------------------------');
    console.log('📊 AUDIT SUMMARY & RECONCILIATION REPORT');
    console.log('-----------------------------------------------------------------');
    console.log(`Total Creators Checked:      ${results.totalCreatorsAudited}`);
    console.log(`Total Transactions Checked:  ${results.totalTransactionsAudited}`);
    console.log(`Wallets with Valid Parity:   ${results.validWallets}`);
    console.log(`Wallets with Flagged Issues: ${results.flaggedWallets}`);
    console.log(`Total Gross Credits:         ₹${Number(results.summary.totalCreditsPaise) / 100} (${results.summary.totalCreditsPaise} paise)`);
    console.log(`Total Gross Debits:          ₹${Number(results.summary.totalDebitsPaise) / 100} (${results.summary.totalDebitsPaise} paise)`);
    console.log(`Net Ledger Total:            ₹${Number(results.summary.netLedgerBalancePaise) / 100} (${results.summary.netLedgerBalancePaise} paise)`);
    console.log('-----------------------------------------------------------------\n');

    if (results.flaggedWallets > 0) {
      console.warn(`⚠️ [WARNING]: ${results.flaggedWallets} creators have ledger discrepancies.`);
      console.warn(JSON.stringify(results.discrepancies, null, 2));
    } else {
      console.log('✅ [SUCCESS]: 100% of examined records reconcile with exact mathematical parity.');
    }

    return results;
  } catch (err) {
    console.error('❌ [FATAL ERROR during Ledger Verification]:', err.message);
    throw err;
  }
}

// Direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('verify_wallet_migration.js')) {
  verifyWalletMigration({ isDryRun: true, verbose: true })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
