import { base64Encode, base58Decode, MAIN_NET_CHAIN_ID } from '@waves/ts-lib-crypto'
import { IInvokeScriptTransaction, invokeScript, IInvokeScriptParams, WithId } from '@waves/waves-transactions'

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

type Args<T> = T extends (...args: infer U) => infer R ? U : never
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>
type Return<T, R> = (...a: Args<T>) => R
type TContract<TDapp, TBuilder> = Omit<{ [TFunc in keyof TDapp]: Return<TDapp[TFunc], TBuilder> }, 'id'> & {
  id: string
}

type TInvokeScriptTx = IInvokeScriptTransaction & WithId



type WithSeed = {
  seed: string
}

type TDefaultContractParams = {
  dApp?: string
  seed?: string
} | undefined

type TInvokeScriptParams<TDefaultParams> =
  TDefaultParams extends undefined
  ? Omit<IInvokeScriptParams, 'call'> & WithSeed
  : TDefaultParams extends { dApp: string, seed: string }
  ? Optional<Omit<IInvokeScriptParams, 'call'>, 'dApp'> & { seed?: string }
  : TDefaultParams extends { dApp: string }
  ? Optional<Omit<IInvokeScriptParams, 'call'>, 'dApp'> & WithSeed
  : Omit<IInvokeScriptParams, 'call'> & { seed?: string }

type TInvoke<TDefaultParams> =
  TDefaultParams extends { dApp: string, seed: string }
  ? { invoke: (params?: TInvokeScriptParams<TDefaultParams>) => TInvokeScriptTx }
  : { invoke: (params: TInvokeScriptParams<TDefaultParams>) => TInvokeScriptTx }


export const contract = <TDefinition>() => <T extends TDefaultContractParams = undefined>(contractParams: T = undefined): TContract<TDefinition, TInvoke<T>> =>
  new Proxy({}, {
    get: (_: any, name: string) =>
      (...args: any[]): TInvoke<T> =>
        ({
          invoke: (params?: TInvokeScriptParams<T>) => {

            const dApp = params?.dApp ?? contractParams.dApp
            const seed = params?.seed ?? contractParams.seed

            return invokeScript({
              chainId: base58Decode(((params || { dApp: undefined }).dApp || dApp) || base64Encode([0, MAIN_NET_CHAIN_ID]))[1],
              dApp,
              call: {
                function: name,
                args: args.map(mapArg),
              },
              ...params,
            }, seed)
          },
        }) as any,
  }) as TContract<TDefinition, TInvoke<T>>












