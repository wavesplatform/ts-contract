import { base58Decode, base64Encode, MAIN_NET_CHAIN_ID } from '@waves/ts-lib-crypto'
import { IInvokeScriptTransaction, WithId, invokeScript, IInvokeScriptParams } from '@waves/waves-transactions'

export type ByteVector = Uint8Array | Array<number> | Buffer
export type DataTypes = 'binary' | 'integer' | 'boolean' | 'string'

interface IInvokeScriptCallStringArgument {
  type: 'string';
  value: string;
}
interface IInvokeScriptCallBinaryArgument {
  type: 'binary';
  value: string;
}
interface IInvokeScriptCallBoolArgument {
  type: 'boolean';
  value: boolean;
}
interface IInvokeScriptCallIntegerArgument<LONG = string | number> {
  type: 'integer';
  value: LONG;
}
interface IInvokeScriptCallListArgument<LONG = string | number> {
  type: 'list';
  value: Exclude<TInvokeScriptCallArgument<LONG>, IInvokeScriptCallListArgument<LONG>>[];
}

type TInvokeScriptCallArgument<LONG = string | number> = IInvokeScriptCallStringArgument | IInvokeScriptCallBinaryArgument | IInvokeScriptCallBoolArgument | IInvokeScriptCallIntegerArgument<LONG> | IInvokeScriptCallListArgument<LONG>;


const typeMap: Record<string, DataTypes> = {
  boolean: 'boolean',
  string: 'string',
  number: 'integer',
  object: 'binary',
}

const mapArg = (value: String | Boolean | Number | ByteVector): TInvokeScriptCallArgument =>
({
  type: typeMap[typeof value],
  value: (typeof value) === 'object' ? 'base64:' + base64Encode(Uint8Array.from(<any>value)) : <any>value,
})

type InvokeScriptTx = IInvokeScriptTransaction & WithId

export type InvokeParams = Partial<Omit<IInvokeScriptParams, 'call'>> & { seed?: string }

type Index = { [k: string]: any }

type InvokeScriptParams<TInvokeDefaultParams> =
  (
    TInvokeDefaultParams extends { dApp: string }
    ? TInvokeDefaultParams extends { seed: string }
    ? {}
    : { seed: string } //dApp only
    : TInvokeDefaultParams extends { seed: string }
    ? { dApp: string } //seed only
    : { dApp: string, seed: string } //empty or undefined
  ) & InvokeParams


type ContractMethod<K extends keyof TContractDefinition, TContractDefinition extends Index, TInvokeDefaultParams, TOut> =
  TInvokeDefaultParams extends undefined
  ? (args: Parameters<TContractDefinition[K]>, params: InvokeScriptParams<TInvokeDefaultParams>) => TOut
  : TInvokeDefaultParams extends { dApp: string, seed: string }
  ? (args: Parameters<TContractDefinition[K]>, params?: InvokeScriptParams<TInvokeDefaultParams>) => TOut
  : (args: Parameters<TContractDefinition[K]>, params: InvokeScriptParams<TInvokeDefaultParams>) => TOut

type Contract<TContractDefinition, TInvokeDefaultParams, TOut> = { [K in keyof TContractDefinition]: ContractMethod<K, TContractDefinition, TInvokeDefaultParams, TOut> }

export const contract = <TContractDefinition extends Index>() =>
  <TInvokeDefaultParams extends InvokeParams, TOut = InvokeScriptTx>(invokeDefaultParams?: TInvokeDefaultParams, txMap?: (tx: InvokeScriptTx) => TOut): Contract<TContractDefinition, TInvokeDefaultParams, TOut> =>
    new Proxy({}, {
      get: (_: any, name: string) =>
        (args: any[], params?: InvokeParams): TOut => {
          const map = txMap ?? (x => x as unknown as TOut)
          
          const p = { ...invokeDefaultParams, ...params } as InvokeParams
          const dApp = p.dApp!
          const seed = p.seed!
          p.chainId = base58Decode(((params || { dApp: undefined }).dApp || dApp) || base64Encode([0, MAIN_NET_CHAIN_ID]))[1]
          
          const tx = invokeScript({
            ...p,
            dApp,
            call: {
              function: name,
              args: args.map(mapArg),
            },
          }, seed)

          return map(tx)
        },
    }) as Contract<TContractDefinition, TInvokeDefaultParams, TOut>

