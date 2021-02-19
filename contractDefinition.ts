
import { ByteVector, contract } from '@waves/ts-contract'

export interface contractDefinition {
  initialize(configAddress: String, assetId: String, aTokenName: String, aTokenDescription: String, aTokenDecimals: Number): void
  repay(): void
  deposit(): void
  stake(): void
  borrow(amountToBorrow: Number): void
  unstake(amountToUnstake: Number): void
  withdraw()
}

export const { initialize, repay, deposit, stake, borrow, unstake, withdraw } = contract<contractDefinition>()()
