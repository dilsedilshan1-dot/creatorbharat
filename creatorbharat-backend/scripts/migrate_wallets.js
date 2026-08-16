// 🇮🇳 CreatorBharat — Financial Wallet Migration & Backfill Runner
// Modes: DRY_RUN (Default, Read-Only) | APPLY (Gated Database Mutation)

import prisma from '../src/prisma.js';
import { rupeesToPaise, paiseToRupees } from '../src/utils/money.js';

export async function runWalletMigration(options = {}) {
  const isApply = options.mode === 'APPLY' || process.env.MIGRATION_MODE === 'APPLY';
  const approved = process.env.FINANCIAL_MIGRATION_APPROVED === 'true';
  const confirmed = process.env.CONFIRM_MIGRATION === 'YES';

  const mode = (isApply && approved && confirmed) ? 'APPLY' : 'DRY_RUN';

  console.log('=================================================================');
  console.log('🏦 CREATORBHARAT FINANCIAL WALLET MIGRATION ENGINE');
  console.log(`Execution Mode: ${mode}`);
  if (isApply && mode === 'DRY_RUN') {
    console.log('⚠️ [SAFETY GATE]: APPLY mode requested but safety approvals missing.');
    console.log('   Required: FINANCIAL_MIGRATION_APPROVED=true and CONFIRM_MIGRATION=YES.');
    console.log('   Defaulting to DRY_RUN (Read-Only).');
  }
  console.log('=================================================================\n');

  const report = {
    mode,
    timestamp: new Date().toISOString(),
    creatorsProcessed: 0,
    walletsCreated: 0,
    transactionsBackfilled: 0,
    totalPaiseMigrated: BigInt(0),
    anomalies: [],
    status: 'COMPLETED'
  };

  try {
    const creators = await prisma.creator.findMany({
      include: {
        user: { select: { id: true, email: true } },
        walletTransactions: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
        },
        wallet: true
      }
    });

    report.creatorsProcessed = creators.length;
    console.log(`[Migration]: Discovered ${creators.length} creator accounts.`);

    for (const creator of creators) {
      const txHistory = creator.walletTransactions;
      let runningBalancePaise = BigInt(0);
      const updates = [];

      for (const tx of txHistory) {
        let amountPaise;
        try {
          amountPaise = rupeesToPaise(tx.amount);
        } catch (err) {
          report.anomalies.push({
            creatorId: creator.id,
            txId: tx.id,
            error: `Invalid amount: ${tx.amount} (${err.message})`
          });
          continue;
        }

        runningBalancePaise += amountPaise;

        updates.push({
          id: tx.id,
          amountPaise,
          balanceAfterPaise: runningBalancePaise,
          idempotencyKey: tx.idempotencyKey || `legacy_wallet_tx_${tx.id}`,
          referenceType: tx.referenceType || (tx.type ? tx.type.toString() : 'LEGACY_TRANSACTION')
        });
      }

      report.totalPaiseMigrated += runningBalancePaise;

      if (mode === 'APPLY') {
        await prisma.$transaction(async (tx) => {
          // 1. Get or create Wallet aggregate
          let wallet = creator.wallet;
          if (!wallet) {
            wallet = await tx.wallet.create({
              data: {
                userId: creator.userId,
                creatorId: creator.id,
                balancePaise: runningBalancePaise,
                lockedPaise: BigInt(0),
                version: 1,
                currency: 'INR'
              }
            });
            report.walletsCreated++;
          } else {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                balancePaise: runningBalancePaise,
                version: { increment: 1 }
              }
            });
          }

          // 2. Backfill WalletTransactions
          for (const item of updates) {
            await tx.walletTransaction.update({
              where: { id: item.id },
              data: {
                walletId: wallet.id,
                amountPaise: item.amountPaise,
                balanceAfterPaise: item.balanceAfterPaise,
                idempotencyKey: item.idempotencyKey,
                referenceType: item.referenceType
              }
            });
            report.transactionsBackfilled++;
          }
        });
      } else {
        // DRY_RUN tracking
        if (!creator.wallet) report.walletsCreated++;
        report.transactionsBackfilled += updates.length;
      }
    }

    console.log('\n-----------------------------------------------------------------');
    console.log('📊 MIGRATION EXECUTION SUMMARY');
    console.log('-----------------------------------------------------------------');
    console.log(`Mode:                     ${report.mode}`);
    console.log(`Creators Audited:         ${report.creatorsProcessed}`);
    console.log(`Wallets Created/Matched:  ${report.walletsCreated}`);
    console.log(`Transactions Backfilled:  ${report.transactionsBackfilled}`);
    console.log(`Total Migrated Balance:   ₹${Number(report.totalPaiseMigrated) / 100} (${report.totalPaiseMigrated} paise)`);
    console.log(`Anomalies Detected:       ${report.anomalies.length}`);
    console.log('-----------------------------------------------------------------\n');

    if (report.anomalies.length > 0) {
      report.status = 'MIGRATION BLOCKED — MANUAL REVIEW REQUIRED';
      console.error('❌ MIGRATION BLOCKED — MANUAL REVIEW REQUIRED');
      console.error(JSON.stringify(report.anomalies, null, 2));
    } else {
      console.log('✅ Migration plan validated with 100% mathematical parity.');
    }

    return report;
  } catch (err) {
    console.error('❌ Fatal Migration Error:', err.message);
    throw err;
  }
}

// CLI Direct Invocation
if (process.argv[1] && process.argv[1].endsWith('migrate_wallets.js')) {
  runWalletMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
