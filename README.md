# ts-contract

## Installation
```
npm i @waves/ts-contract
```

## Contract definitions and Invoke script transaction
Lest take a look on a simple contract definition:
```ts
interface myContract {
  foo(value: String)
}
```
Every interface method should correspond to **@Callable(i)** function in your .ride smart contract. In this case the contract is pretty simple: 
```ts
{-# STDLIB_VERSION 3 #-}
{-# CONTENT_TYPE DAPP #-}
{-# SCRIPT_TYPE ACCOUNT #-}

@Callable(i)
func foo(value: String) = {
    WriteSet([
        DataEntry("data", value.size())
    ])
}
```

You can use it to get invoke transaction builder:
```ts
import { contract } from '@waves/ts-contract'
const { foo } = contract<myContract>()('3MwGdE779Vhf4bkn8UbqQqEQwos38KtWhsn')
foo('hello').invoke('seed') // => IInvokeScriptTransaction
```
In case your application use multiple contracts with the same code you can specify dApp address and when calling invoke itself
```ts
import { contract } from '@waves/ts-contract'
const { foo } = contract<myContract>()()
foo('hello')
  .invoke('seed', { dApp: '3MwGdE779Vhf4bkn8UbqQqEQwos38KtWhsn' })
  // => IInvokeScriptTransaction
```

## Generate code
To auto generate definitions run the following command in project folder terminal:
```
npx @waves/ts-contract 3MwGdE779Vhf4bkn8UbqQqEQwos38KtWhsn ./myContract.ts
```
Where **3MwGdE779Vhf4bkn8UbqQqEQwos38KtWhsn** is deployed dApp addrÏess.

Or if you want to generate code from **.ride file** call:
```
npx @waves/ts-contract ./src/myContract.ride ./myContract.ts
```
The generated **myContract.ts** file will look like this:
```ts
import { ByteVector, contract } from '@waves/ts-contract'

export interface myContract {
  foo(value: String | Number | Boolean | ByteVector)
}
export const { foo } = contract<myContract>()('3MwGdE779Vhf4bkn8UbqQqEQwos38KtWhsn')
```

