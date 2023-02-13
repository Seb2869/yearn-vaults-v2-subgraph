import {
  dataSource,
  log,
  Address,
  ethereum,
  BigInt,
} from '@graphprotocol/graph-ts';
import {
  NewRelease as NewReleaseEvent,
  NewVault as NewVaultEvent,
  NewVault1 as NewVault1Event,
  NewExperimentalVault as NewExperimentalVaultEvent,
  VaultTagged as VaultTaggedEvent,
} from '../../generated/Registry/Registry';
import { NewVault as NewVaultV3Event } from '../../generated/RegistryV3/RegistryV3';
import { getOrCreateTransactionFromEvent } from '../utils/transaction';
import * as vaultLibrary from '../utils/vault/vault';
import * as registryLibrary from '../utils/registry/registry';
import {
  DO_CREATE_VAULT_TEMPLATE,
  REGISTRY_V3_VAULT_TYPE_LEGACY,
} from '../utils/constants';

export function handleNewRelease(event: NewReleaseEvent): void {
  let registryAddress = dataSource.address();
  handleNewReleaseInner(registryAddress, event);
}

/** We use an inner function because we cannot mock dataSource yet. https://github.com/LimeChain/matchstick/issues/168 */
export function handleNewReleaseInner(
  registryAddress: Address,
  event: NewReleaseEvent
): void {
  log.info(
    '[Registry] NewRelease: Registry {} - ApiVersion {} - ReleaseID {} - Template {} - Sender {} TX {}',
    [
      registryAddress.toHexString(),
      event.params.api_version,
      event.params.release_id.toString(),
      event.params.template.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'Registry-FirstNewReleaseEvent'
  );
  registryLibrary.getOrCreate(registryAddress, ethTransaction);
  vaultLibrary.release(
    event.params.template,
    event.params.api_version,
    event.params.release_id,
    event,
    ethTransaction
  );
}

export function handleNewVault(event: NewVaultEvent): void {
  let registryAddress = dataSource.address();
  handleNewVaultInner(
    registryAddress,
    event.params.api_version,
    event.params.deployment_id,
    event.params.token,
    event.params.vault,
    REGISTRY_V3_VAULT_TYPE_LEGACY,
    event
  );
}

export function handleNewVaultInVaultRegistry(event: NewVault1Event): void {
  let registryAddress = dataSource.address();

  handleNewVaultInner(
    registryAddress,
    event.params.apiVersion,
    BigInt.zero(),
    event.params.token,
    event.params.vault,
    REGISTRY_V3_VAULT_TYPE_LEGACY,
    event
  );
}

/** We use an inner function because we cannot mock dataSource yet. https://github.com/LimeChain/matchstick/issues/168 */
export function handleNewVaultInner(
  registryAddress: Address,
  apiVersion: string,
  _deploymentId: BigInt,
  _tokenAddress: Address,
  vaultAddress: Address,
  vaultType: BigInt,
  event: ethereum.Event
): void {
  log.info(
    '[Registry] NewVault: Registry {} - New vault {} - Sender {} - TX {}',
    [
      registryAddress.toHexString(),
      vaultAddress.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'NewVaultEvent');
  let registry = registryLibrary.getOrCreate(registryAddress, ethTransaction);
  vaultLibrary.create(
    registry,
    ethTransaction,
    vaultAddress,
    'Endorsed',
    apiVersion,
    DO_CREATE_VAULT_TEMPLATE,
    vaultType
  );
}

export function handleNewExperimentalVault(
  event: NewExperimentalVaultEvent
): void {
  let registryAddress = dataSource.address();
  log.info(
    '[Registry] NewExperimentalVault: Registry {} - Experimental vault {} - Sender {} - TX {}',
    [
      dataSource.address().toHexString(),
      event.params.vault.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );

  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'NewExperimentalVault'
  );
  let registry = registryLibrary.getOrCreate(registryAddress, ethTransaction);
  vaultLibrary.create(
    registry,
    ethTransaction,
    event.params.vault,
    'Experimental',
    event.params.api_version,
    DO_CREATE_VAULT_TEMPLATE,
    REGISTRY_V3_VAULT_TYPE_LEGACY
  );
}

export function handleVaultTagged(event: VaultTaggedEvent): void {
  log.info(
    '[Registry] VaultTagged: Registry {} - Vault {} - Tag {} - Sender {} - TX {}',
    [
      dataSource.address().toHexString(),
      event.params.vault.toHexString(),
      event.params.tag,
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  vaultLibrary.tag(event.params.vault, event.params.tag);
}

export function handleNewVaultInRegistryV3(event: NewVaultV3Event): void {
  let registryAddress = dataSource.address();
  handleNewVaultInner(
    registryAddress,
    event.params.apiVersion,
    event.params.vaultId,
    event.params.token,
    event.params.vault,
    event.params.vaultType,
    event
  );
}
