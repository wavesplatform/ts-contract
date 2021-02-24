
import { ByteVector, InvokeParams, contract } from '@waves/ts-contract'

export interface example2ContractDefinition {
  initialize(configAddress: String, assetId: String, aTokenName: String, aTokenDescription: String, aTokenDecimals: Number): void
  repay(): void
  deposit(): void
  stake(): void
  borrow(amountToBorrow: Number): void
  unstake(amountToUnstake: Number): void
  withdraw(): void
}

export const { initialize, repay, deposit, stake, borrow, unstake, withdraw } = contract<example2ContractDefinition>()()

export const example2Contract = <T extends InvokeParams>(defaultParams?: T) =>
  contract<example2ContractDefinition>()(defaultParams)
  
