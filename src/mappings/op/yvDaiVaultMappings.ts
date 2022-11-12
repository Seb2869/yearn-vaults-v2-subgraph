import {
  UpdateDepositLimit,
  UpdateGovernance,
  UpdateGuardian,
  UpdateManagement,
} from '../../../generated/OPyvDAIVault/Vault';
import {
  StrategyAdded1 as StrategyAddedV2Event,
  UpdateManagementFee as UpdateManagementFeeEvent,
  UpdatePerformanceFee as UpdatePerformanceFeeEvent,
  Vault as VaultContract,
} from '../../../generated/Registry/Vault';
import { isEventBlockNumberLt } from '../../utils/commons';
import {
  BIGINT_ZERO,
  OP_DAI_VAULT_VAULT_END_BLOCK_CUSTOM,
} from '../../utils/constants';
import * as strategyLibrary from '../../utils/strategy/strategy';
import { getOrCreateTransactionFromEvent } from '../../utils/transaction';
import * as vaultLibrary from '../../utils/vault/vault';

/**
 * The strategy for this vault wasn't processed  using the registry because the strategy was added before the vault was registered.

  Registry created at #22451152
  DAI vault added to Registry #27372960 https://optimistic.etherscan.io/tx/0x760c523dfc92004ab56a5d23f3274318e3d51acaea0b0aae27f44dfec99f9100
  Aave Strategy added to DAI Vault #22577448 https://optimistic.etherscan.io/tx/0xa24395f2ebc6c4c61246189b83d74da0768c270a76aaf31c0fc032c87ea30c40

  This custom handler, handle the new strategies in that block range. 
 */
/* This version of the AddStrategy event is used in vaults 0.3.2 and up */
export function handleStrategyAddedV2(event: StrategyAddedV2Event): void {
  if (
    isEventBlockNumberLt(
      'OPyvDAIVault_AddStrategyV2Event',
      event.block,
      OP_DAI_VAULT_VAULT_END_BLOCK_CUSTOM
    )
  ) {
    let transaction = getOrCreateTransactionFromEvent(
      event,
      'OPyvDAIVault_AddStrategyV2Event'
    );
    strategyLibrary.createAndGet(
      transaction.id,
      event.params.strategy,
      event.address,
      event.params.debtRatio,
      BIGINT_ZERO,
      event.params.minDebtPerHarvest,
      event.params.maxDebtPerHarvest,
      event.params.performanceFee,
      null,
      transaction,
      BIGINT_ZERO
    );
  }
}

export function handleUpdatePerformanceFee(
  event: UpdatePerformanceFeeEvent
): void {
  if (
    isEventBlockNumberLt(
      'OPyvDAIVault_UpdatePerformanceFeeEvent',
      event.block,
      OP_DAI_VAULT_VAULT_END_BLOCK_CUSTOM
    )
  ) {
    let ethTransaction = getOrCreateTransactionFromEvent(
      event,
      'UpdatePerformanceFee'
    );

    let vaultContract = VaultContract.bind(event.address);

    vaultLibrary.performanceFeeUpdated(
      event.address,
      ethTransaction,
      vaultContract,
      event.params.performanceFee
    );
  }
}

export function handleUpdateManagementFee(
  event: UpdateManagementFeeEvent
): void {
  if (
    isEventBlockNumberLt(
      'OPyvDAIVault_UpdateManagementFeeEvent',
      event.block,
      OP_DAI_VAULT_VAULT_END_BLOCK_CUSTOM
    )
  ) {
    let ethTransaction = getOrCreateTransactionFromEvent(
      event,
      'UpdateManagementFee'
    );

    let vaultContract = VaultContract.bind(event.address);

    vaultLibrary.managementFeeUpdated(
      event.address,
      ethTransaction,
      vaultContract,
      event.params.managementFee
    );
  }
}

export function handleUpdateGuardian(event: UpdateGuardian): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'UpdateGuardian');

  vaultLibrary.handleUpdateGuardian(
    event.address,
    event.params.guardian,
    ethTransaction
  );
}

export function handleUpdateManagement(event: UpdateManagement): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'UpdateManagement'
  );

  vaultLibrary.handleUpdateManagement(
    event.address,
    event.params.management,
    ethTransaction
  );
}

export function handleUpdateGovernance(event: UpdateGovernance): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'UpdateGovernance'
  );

  vaultLibrary.handleUpdateGovernance(
    event.address,
    event.params.governance,
    ethTransaction
  );
}

export function handleUpdateDepositLimit(event: UpdateDepositLimit): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'UpdateDepositLimit'
  );

  vaultLibrary.handleUpdateDepositLimit(
    event.address,
    event.params.depositLimit,
    ethTransaction
  );
}
