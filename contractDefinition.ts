
import { address, randomSeed } from '@waves/ts-lib-crypto'
import { contract } from './src/cont'

export interface contractDefinition {
  initialize(configAddress: String, assetId: String, aTokenName: String, aTokenDescription: String, aTokenDecimals: Number): void
  repay(): void
  deposit(): void
  stake(): void
  borrow(amountToBorrow: Number): void
  unstake(amountToUnstake: Number): void
  withdraw(): void
}

export const { initialize, repay, deposit, stake, borrow, unstake, withdraw } = contract<contractDefinition>()()

export const create = () => { 
  contract<contractDefinition>()()
}


const a = contract<contractDefinition>()({ dApp: address(randomSeed()), seed: '' }).borrow([0], { payment: [{ amount: 10 }] })


// invokeBroadcaster<contractDefinition>((tx) => Promise.resolve(tx))({ dApp: '' })
// invokeBuilder<contractDefinition>()().borrow(0).build()

