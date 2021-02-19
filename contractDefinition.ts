
import { ByteVector, contract } from '@waves/ts-contract'

export interface contractDefinition {
  initialize(configAddress: String, assetId: String, aTokenName: String, aTokenDescription: String, aTokenDecimals: Number)
  repay()
  deposit()
  stake()
  borrow(amountToBorrow: Number)
  unstake(amountToUnstake: Number)
  withdraw()
}

export const { initialize, repay, deposit, stake, borrow, unstake, withdraw } = contract<contractDefinition>()()

