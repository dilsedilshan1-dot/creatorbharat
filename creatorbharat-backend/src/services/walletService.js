// 🇮🇳 CreatorBharat — Enterprise Financial Ledger Service
// Enforces strict double-entry ledger immutability, optimistic concurrency control,
// idempotency deduplication, and zero-loss integer Paise accounting.

import prisma from '../prisma.js';
import { rupeesToPaise, paiseToRupees } from '../utils/money.js';

export class FinancialError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'FinancialError';
    this.code = code;
    this.details = details;
  }
}

export class WalletService {
  /**
   * Retrieves or creates a canonical Wallet aggregate for a user/creator.
   *
   * @param {string} userId - User ID
   * @param {string} [creatorId] - Creator ID (if applicable)
   * @param {Object} [client] - Prisma client or active transaction
   * @returns {Promise<Object>} Wallet record
   */
  static async getOrCreateWallet(userId, creatorId = null, client = prisma) {
    if (!userId) {
      throw new FinancialError('INVALID_OWNER', 'userId is required to initialize a Wallet.');
    }

    let wallet = await client.wallet.findFirst({
      where: {
        OR: [
          { userId },
          ...(creatorId ? [{ creatorId }] : [])
        ]
      }
    });

    if (!wallet) {
      wallet = await client.wallet.create({
        data: {
          userId,
          creatorId,
          balancePaise: BigInt(0),
          lockedPaise: BigInt(0),
          version: 1,
          currency: 'INR'
        }
      });
    }

    return wallet;
  }

  /**
   * Retrieves current wallet balance summary.
   *
   * @param {string} walletId - Wallet ID
   * @param {Object} [client] - Prisma client
   * @returns {Promise<{ id: string, balancePaise: BigInt, lockedPaise: BigInt, totalEconomicPaise: BigInt, balanceINR: number, lockedINR: number, version: number }>}
   */
  static async getWalletBalance(walletId, client = prisma) {
    const wallet = await client.wallet.findUnique({
      where: { id: walletId }
    });

    if (!wallet) {
      throw new FinancialError('WALLET_NOT_FOUND', `Wallet ${walletId} not found.`);
    }

    const totalEconomicPaise = wallet.balancePaise + wallet.lockedPaise;

    return {
      id: wallet.id,
      userId: wallet.userId,
      creatorId: wallet.creatorId,
      balancePaise: wallet.balancePaise,
      lockedPaise: wallet.lockedPaise,
      totalEconomicPaise,
      balanceINR: paiseToRupees(wallet.balancePaise),
      lockedINR: paiseToRupees(wallet.lockedPaise),
      totalEconomicINR: paiseToRupees(totalEconomicPaise),
      version: wallet.version
    };
  }

  /**
   * Credits funds into a wallet and records an immutable ledger entry.
   *
   * @param {string} walletId
   * @param {BigInt|number} amountPaise
   * @param {Object} options
   * @param {string} options.type - 'CAMPAIGN_PAYOUT' | 'REFERRAL_REWARD' | 'REFUND'
   * @param {string} options.description
   * @param {string} [options.referenceType]
   * @param {string} [options.referenceId]
   * @param {string} [options.idempotencyKey]
   * @param {Object} [options.metadata]
   * @param {Object} [externalTx]
   * @returns {Promise<{ wallet: Object, transaction: Object }>}
   */
  static async credit(walletId, amountPaise, options, externalTx = null) {
    const paise = typeof amountPaise === 'bigint' ? amountPaise : BigInt(amountPaise);
    if (paise <= BigInt(0)) {
      throw new FinancialError('INVALID_AMOUNT', 'Credit amount must be greater than zero.');
    }

    const execute = async (tx) => {
      // 1. Idempotency Verification
      if (options.idempotencyKey || options.referenceId) {
        const existingTx = await tx.walletTransaction.findFirst({
          where: {
            OR: [
              ...(options.idempotencyKey ? [{ idempotencyKey: options.idempotencyKey }] : []),
              ...(options.referenceId ? [{ referenceId: options.referenceId }] : [])
            ]
          }
        });

        if (existingTx) {
          const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });
          return { wallet: currentWallet, transaction: existingTx, isDuplicate: true };
        }
      }

      // 2. Fetch current wallet
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new FinancialError('WALLET_NOT_FOUND', `Wallet ${walletId} does not exist.`);
      }

      const newBalancePaise = wallet.balancePaise + paise;

      // 3. Optimistic Concurrency Conditional Update
      const updateResult = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          version: wallet.version
        },
        data: {
          balancePaise: newBalancePaise,
          version: { increment: 1 }
        }
      });

      if (updateResult.count === 0) {
        throw new FinancialError('CONCURRENCY_CONFLICT', 'Wallet updated concurrently. Please retry.');
      }

      // 4. Create Immutable Ledger Entry
      const legacyAmountINR = Math.round(Number(paise) / 100);
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          creatorId: wallet.creatorId || wallet.userId,
          amount: legacyAmountINR,
          amountPaise: paise,
          balanceAfterPaise: newBalancePaise,
          type: options.type || 'CAMPAIGN_PAYOUT',
          status: 'SUCCESS',
          description: options.description || 'Credit to wallet',
          referenceType: options.referenceType || null,
          referenceId: options.referenceId || null,
          idempotencyKey: options.idempotencyKey || null,
          metadata: options.metadata || null
        }
      });

      const updatedWallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return { wallet: updatedWallet, transaction: ledgerEntry, isDuplicate: false };
    };

    return externalTx ? execute(externalTx) : prisma.$transaction(execute);
  }

  /**
   * Debits funds from a wallet with strict double-spend and insufficient-balance protection.
   *
   * @param {string} walletId
   * @param {BigInt|number} amountPaise
   * @param {Object} options
   * @param {string} options.type - 'BANK_WITHDRAWAL'
   * @param {string} options.description
   * @param {string} [options.referenceType]
   * @param {string} [options.referenceId]
   * @param {string} [options.idempotencyKey]
   * @param {Object} [options.metadata]
   * @param {Object} [externalTx]
   * @returns {Promise<{ wallet: Object, transaction: Object }>}
   */
  static async debit(walletId, amountPaise, options, externalTx = null) {
    const paise = typeof amountPaise === 'bigint' ? amountPaise : BigInt(amountPaise);
    if (paise <= BigInt(0)) {
      throw new FinancialError('INVALID_AMOUNT', 'Debit amount must be greater than zero.');
    }

    const execute = async (tx) => {
      // 1. Idempotency Check
      if (options.idempotencyKey || options.referenceId) {
        const existingTx = await tx.walletTransaction.findFirst({
          where: {
            OR: [
              ...(options.idempotencyKey ? [{ idempotencyKey: options.idempotencyKey }] : []),
              ...(options.referenceId ? [{ referenceId: options.referenceId }] : [])
            ]
          }
        });

        if (existingTx) {
          const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });
          return { wallet: currentWallet, transaction: existingTx, isDuplicate: true };
        }
      }

      // 2. Fetch current wallet
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) {
        throw new FinancialError('WALLET_NOT_FOUND', `Wallet ${walletId} does not exist.`);
      }

      if (wallet.balancePaise < paise) {
        throw new FinancialError(
          'INSUFFICIENT_FUNDS',
          `Insufficient balance. Available: ₹${paiseToRupees(wallet.balancePaise)}, Requested: ₹${paiseToRupees(paise)}`
        );
      }

      const newBalancePaise = wallet.balancePaise - paise;

      // 3. Conditional Atomic Update (Version match + Balance >= Requested)
      const updateResult = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          version: wallet.version,
          balancePaise: { gte: paise }
        },
        data: {
          balancePaise: newBalancePaise,
          version: { increment: 1 }
        }
      });

      if (updateResult.count === 0) {
        throw new FinancialError(
          'CONCURRENCY_CONFLICT_OR_INSUFFICIENT_FUNDS',
          'Concurrency collision or insufficient balance during debit execution.'
        );
      }

      // 4. Create Immutable Ledger Entry
      const legacyAmountINR = -Math.round(Number(paise) / 100);
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          creatorId: wallet.creatorId || wallet.userId,
          amount: legacyAmountINR,
          amountPaise: -paise,
          balanceAfterPaise: newBalancePaise,
          type: options.type || 'BANK_WITHDRAWAL',
          status: 'SUCCESS',
          description: options.description || 'Debit from wallet',
          referenceType: options.referenceType || null,
          referenceId: options.referenceId || null,
          idempotencyKey: options.idempotencyKey || null,
          metadata: options.metadata || null
        }
      });

      const updatedWallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return { wallet: updatedWallet, transaction: ledgerEntry, isDuplicate: false };
    };

    return externalTx ? execute(externalTx) : prisma.$transaction(execute);
  }

  /**
   * Locks funds from available balance into locked escrow / pending payout status.
   */
  static async lock(walletId, amountPaise, options = {}, externalTx = null) {
    const paise = typeof amountPaise === 'bigint' ? amountPaise : BigInt(amountPaise);
    if (paise <= BigInt(0)) {
      throw new FinancialError('INVALID_AMOUNT', 'Lock amount must be greater than zero.');
    }

    const execute = async (tx) => {
      // 1. Idempotency Check
      if (options.idempotencyKey || options.referenceId) {
        const existingTx = await tx.walletTransaction.findFirst({
          where: {
            OR: [
              ...(options.idempotencyKey ? [{ idempotencyKey: options.idempotencyKey }] : []),
              ...(options.referenceId ? [{ referenceId: options.referenceId }] : [])
            ]
          }
        });

        if (existingTx) {
          const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });
          return { wallet: currentWallet, transaction: existingTx, isDuplicate: true };
        }
      }

      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new FinancialError('WALLET_NOT_FOUND', `Wallet ${walletId} does not exist.`);

      if (wallet.balancePaise < paise) {
        throw new FinancialError('INSUFFICIENT_FUNDS', 'Insufficient available balance to lock.');
      }

      const newBalancePaise = wallet.balancePaise - paise;
      const newLockedPaise = wallet.lockedPaise + paise;

      const updateResult = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          version: wallet.version,
          balancePaise: { gte: paise }
        },
        data: {
          balancePaise: newBalancePaise,
          lockedPaise: newLockedPaise,
          version: { increment: 1 }
        }
      });

      if (updateResult.count === 0) {
        throw new FinancialError('CONCURRENCY_CONFLICT', 'Failed to lock funds due to concurrent update.');
      }

      // Create ledger entry for the lock operation
      const legacyAmountINR = -Math.round(Number(paise) / 100);
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          creatorId: wallet.creatorId || wallet.userId,
          amount: legacyAmountINR,
          amountPaise: -paise,
          balanceAfterPaise: newBalancePaise,
          type: options.type || 'BANK_WITHDRAWAL',
          status: 'PENDING',
          description: options.description || 'Funds locked for pending payout',
          referenceType: options.referenceType || 'LOCK_WITHDRAWAL',
          referenceId: options.referenceId || null,
          idempotencyKey: options.idempotencyKey || null,
          metadata: options.metadata || null
        }
      });

      const updatedWallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return { wallet: updatedWallet, transaction: ledgerEntry, isDuplicate: false };
    };

    return externalTx ? execute(externalTx) : prisma.$transaction(execute);
  }

  /**
   * Unlocks locked funds back into available balance (e.g. cancelled withdrawal).
   */
  static async unlock(walletId, amountPaise, options = {}, externalTx = null) {
    const paise = typeof amountPaise === 'bigint' ? amountPaise : BigInt(amountPaise);
    if (paise <= BigInt(0)) {
      throw new FinancialError('INVALID_AMOUNT', 'Unlock amount must be greater than zero.');
    }

    const execute = async (tx) => {
      // 1. Idempotency Check
      if (options.idempotencyKey || options.referenceId) {
        const existingTx = await tx.walletTransaction.findFirst({
          where: {
            OR: [
              ...(options.idempotencyKey ? [{ idempotencyKey: options.idempotencyKey }] : []),
              ...(options.referenceId ? [{ referenceId: options.referenceId }] : [])
            ]
          }
        });

        if (existingTx) {
          const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });
          return { wallet: currentWallet, transaction: existingTx, isDuplicate: true };
        }
      }

      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new FinancialError('WALLET_NOT_FOUND', `Wallet ${walletId} does not exist.`);

      if (wallet.lockedPaise < paise) {
        throw new FinancialError('INSUFFICIENT_LOCKED_FUNDS', 'Requested unlock exceeds locked balance.');
      }

      const newBalancePaise = wallet.balancePaise + paise;
      const newLockedPaise = wallet.lockedPaise - paise;

      const updateResult = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          version: wallet.version,
          lockedPaise: { gte: paise }
        },
        data: {
          balancePaise: newBalancePaise,
          lockedPaise: newLockedPaise,
          version: { increment: 1 }
        }
      });

      if (updateResult.count === 0) {
        throw new FinancialError('CONCURRENCY_CONFLICT', 'Failed to unlock funds due to concurrent update.');
      }

      // Create ledger entry for the unlock operation
      const legacyAmountINR = Math.round(Number(paise) / 100);
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          creatorId: wallet.creatorId || wallet.userId,
          amount: legacyAmountINR,
          amountPaise: paise,
          balanceAfterPaise: newBalancePaise,
          type: options.type || 'REFUND',
          status: 'SUCCESS',
          description: options.description || 'Funds unlocked back to available balance',
          referenceType: options.referenceType || 'UNLOCK_WITHDRAWAL',
          referenceId: options.referenceId || null,
          idempotencyKey: options.idempotencyKey || null,
          metadata: options.metadata || null
        }
      });

      const updatedWallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return { wallet: updatedWallet, transaction: ledgerEntry, isDuplicate: false };
    };

    return externalTx ? execute(externalTx) : prisma.$transaction(execute);
  }

  /**
   * Permanently disburses locked funds (e.g. payout sent to bank via gateway).
   */
  static async release(walletId, amountPaise, options = {}, externalTx = null) {
    const paise = typeof amountPaise === 'bigint' ? amountPaise : BigInt(amountPaise);
    if (paise <= BigInt(0)) {
      throw new FinancialError('INVALID_AMOUNT', 'Release amount must be greater than zero.');
    }

    const execute = async (tx) => {
      // 1. Idempotency Check
      if (options.idempotencyKey || options.referenceId) {
        const existingTx = await tx.walletTransaction.findFirst({
          where: {
            OR: [
              ...(options.idempotencyKey ? [{ idempotencyKey: options.idempotencyKey }] : []),
              ...(options.referenceId ? [{ referenceId: options.referenceId }] : [])
            ]
          }
        });

        if (existingTx) {
          const currentWallet = await tx.wallet.findUnique({ where: { id: walletId } });
          return { wallet: currentWallet, transaction: existingTx, isDuplicate: true };
        }
      }

      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw new FinancialError('WALLET_NOT_FOUND', `Wallet ${walletId} does not exist.`);

      if (wallet.lockedPaise < paise) {
        throw new FinancialError('INSUFFICIENT_LOCKED_FUNDS', 'Release amount exceeds locked balance.');
      }

      const newLockedPaise = wallet.lockedPaise - paise;

      const updateResult = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          version: wallet.version,
          lockedPaise: { gte: paise }
        },
        data: {
          lockedPaise: newLockedPaise,
          version: { increment: 1 }
        }
      });

      if (updateResult.count === 0) {
        throw new FinancialError('CONCURRENCY_CONFLICT', 'Failed to release locked funds due to concurrent update.');
      }

      // Create ledger entry for the disbursement completion
      // Available balance is unchanged (it was already debited at LOCK), so amountPaise is 0n.
      const ledgerEntry = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          creatorId: wallet.creatorId || wallet.userId,
          amount: 0,
          amountPaise: BigInt(0),
          balanceAfterPaise: wallet.balancePaise, // Available balance remains unchanged
          type: options.type || 'BANK_WITHDRAWAL',
          status: 'SUCCESS',
          description: options.description || 'Locked funds disbursed to bank',
          referenceType: options.referenceType || 'RELEASE_LOCKED',
          referenceId: options.referenceId || null,
          idempotencyKey: options.idempotencyKey || null,
          metadata: {
            disbursedAmountPaise: paise.toString(),
            disbursedAmountINR: paiseToRupees(paise),
            ...(options.metadata || {})
          }
        }
      });

      const updatedWallet = await tx.wallet.findUnique({ where: { id: wallet.id } });
      return { wallet: updatedWallet, transaction: ledgerEntry, isDuplicate: false };
    };

    return externalTx ? execute(externalTx) : prisma.$transaction(execute);
  }

  /**
   * Issues a compensatory refund credit to a wallet.
   */
  static async refund(walletId, amountPaise, options = {}, externalTx = null) {
    return this.credit(
      walletId,
      amountPaise,
      {
        ...options,
        type: 'REFUND',
        referenceType: options.referenceType || 'REFUND',
        description: options.description || 'Refund credited to wallet'
      },
      externalTx
    );
  }

  /**
   * Executes an administrative balance adjustment with required audit rationale.
   */
  static async adjust(walletId, amountPaise, options = {}, externalTx = null) {
    const paise = typeof amountPaise === 'bigint' ? amountPaise : BigInt(amountPaise);
    if (!options.reason && !options.description) {
      throw new FinancialError('INVALID_ADJUSTMENT', 'Adjustment requires a specific reason or description.');
    }

    if (paise > BigInt(0)) {
      return this.credit(
        walletId,
        paise,
        {
          ...options,
          type: 'REFUND',
          referenceType: 'ADMIN_ADJUSTMENT',
          description: options.description || `Administrative Credit: ${options.reason || 'Ledger adjustment'}`
        },
        externalTx
      );
    } else if (paise < BigInt(0)) {
      return this.debit(
        walletId,
        -paise,
        {
          ...options,
          type: 'BANK_WITHDRAWAL',
          referenceType: 'ADMIN_ADJUSTMENT',
          description: options.description || `Administrative Debit: ${options.reason || 'Ledger adjustment'}`
        },
        externalTx
      );
    } else {
      throw new FinancialError('INVALID_AMOUNT', 'Adjustment amount cannot be zero.');
    }
  }
}

export default WalletService;
