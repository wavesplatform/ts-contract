import { IContractFunction } from './getMembers'

const typeUnion = 'String | Number | Boolean | ByteVector'

const mapTypeToJs = (type: string) => ({
  'Int': 'Number',
  'Any': 'any',
})[type] ?? type

export const createContractDefinition = (name: string, callables: IContractFunction[], dAppAddress?: string) => {

  const interfaceName = `${name}ContractDefinition`

  return `
import { ByteVector, InvokeParams, contract${name === 'contract' ? ' as createContract' : ''} } from '@waves/ts-contract'

export interface ${interfaceName} {
  ${callables.map(c => `${c.func}(${c.args.map(({ name, type }) => `${name}: ${type ? mapTypeToJs(type) : typeUnion}`).join(', ')}): void`).join('\n  ')}
}

export const { ${callables.map(c => c.func).join(', ')} } = ${name === 'contract' ? 'createContract' : 'contract'}<${interfaceName}>()(${dAppAddress ? `'${dAppAddress}'` : ''})

export const ${name}Contract = <T extends InvokeParams>(defaultParams?: T) =>
  contract<${interfaceName}>()(defaultParams)
  
`
}
