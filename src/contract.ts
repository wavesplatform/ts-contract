import { base64Encode, base58Decode, MAIN_NET_CHAIN_ID } from '@waves/waves-crypto'
import { IInvokeScriptTransaction, invokeScript, IInvokeScriptParams } from '@waves/waves-transactions'

export type ByteVector = Uint8Array | Array<number> | Buffer
export type DataTypes = 'binary' | 'integer' | 'boolean' | 'string'

const typeMap: Record<string, DataTypes> = {
  boolean: 'boolean',
  string: 'string',
  number: 'integer',
  object: 'binary',
}

const mapArg = (value: String | Boolean | Number | ByteVector): {
  type: DataTypes
  value: string | number | boolean
} =>
  ({
    type: typeMap[typeof value],
    value: (typeof value) === 'object' ? 'base64:' + base64Encode(Uint8Array.from(<any>value)) : <any>value,
  })

type Args<T> = T extends (...args: infer U) => infer R ? U : never
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>
type Return<T, R> = (...a: Args<T>) => R
type TContract<TDapp, TBuilder> = Omit<{ [TFunc in keyof TDapp]: Return<TDapp[TFunc], TBuilder> }, 'id'> & { id: string }

type TInvokeMap = {
  undefined: {
    invoke: (seed: string, params: Omit<IInvokeScriptParams, 'call'>) => IInvokeScriptTransaction
  }
  string: {
    invoke(seed: string, params?: Optional<Omit<IInvokeScriptParams, 'call'>, 'dApp'>): IInvokeScriptTransaction
  }
}

type TInvoke<TAddress extends string | undefined> = TInvokeMap[TAddress extends undefined ? 'undefined' : 'string']

export const contract = <TDefinition>() => <TAddress extends string | undefined = undefined>(dApp: TAddress = undefined): TContract<TDefinition, TInvoke<TAddress>> =>
  new Proxy({}, {
    get: (_: any, name: string) =>
      (...args: any[]): TInvoke<TAddress> =>
        ({
          invoke: (seed: string, params?: IInvokeScriptParams) =>
            invokeScript({
              chainId: base58Decode(((params || { dApp: undefined }).dApp || dApp) || base64Encode([0, MAIN_NET_CHAIN_ID]))[1],
              dApp,
              call: {
                function: name,
                args: args.map(mapArg),
              },
              ...params,
            }, seed),
        }),
  }) as TContract<TDefinition, TInvoke<TAddress>>








