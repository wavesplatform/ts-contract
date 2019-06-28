import { ICallable } from './get-callables'

const typeUnion = 'String | Number | Boolean | ByteVector'

export const createContractDefinition = (name: string, callables: ICallable[], dAppAddress?: string) => `
import { ByteVector, contract${name === 'contract' ? ' as createContract' : ''} } from '@waves/ts-contract'

export interface ${name} {
  ${callables.map(c => `${c.func}(${c.args.map(({ name, type }) => `${name}: ${type ? type : typeUnion}`).join(', ')})`).join('\n  ')}
}

export const { ${callables.map(c => c.func).join(', ')} } = ${name === 'contract' ? 'createContract' : 'contract'}<${name}>()(${dAppAddress ? `'${dAppAddress}'` : ''})
`
