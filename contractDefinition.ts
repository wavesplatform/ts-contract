
import { ByteVector, contract } from '@waves/ts-contract'

export interface contractDefinition {
  initialize(configAddress: String, oracleAddress: String, assetId: String, aTokenName: String, aTokenDescription: String, aTokenDecimals: Number): void
  borrowPower(address: String): void
  assetToUsd(assetAmount: Number): void
  repay(): void
  deposit(): void
  stake(): void
  borrowFor(address: String, amountToBorrow: Number): void
  unstake(amountToUnstake: Number): void
  withdrawFor(address: String): void
}

export const { initialize, borrowPower, assetToUsd, repay, deposit, stake, borrowFor, unstake, withdrawFor } = contract<contractDefinition>()()
