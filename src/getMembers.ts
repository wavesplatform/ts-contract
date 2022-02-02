import axios from 'axios'
import { wavesApi, config, axiosHttp } from '@waves/waves-rest'
import { base58Decode, ChaidId, verifyAddress } from '@waves/ts-lib-crypto'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const functionRegex = /\s?.*?func\s+(?<name>\w+)\s?\((?<params>.*?)\)/gs
const callableRegex = /@Callable\s?.*?func\s+(?<name>\w+)\s?\((?<params>.*?)\)/gs
const funcRegex = /func\s+(?<name>[^\( ]*)\s?(?<params>\(.*?\))/s

export interface IArg {
  name: string
  type?: string
}

export interface IContractFunction {
  func: string
  args: IArg[]
}

export type ReturnType = { callables: IContractFunction[], functions: IContractFunction[] }

export const getCallablesFromAddress = async (dAdd: string): Promise<ReturnType> => {
  const chainId = base58Decode(dAdd)[1]
  const conf = ChaidId.isMainnet(chainId) ? config.mainnet : config.testnet
  const { getScriptInfo } = wavesApi(conf, axiosHttp(axios))
  const scriptInfo = await getScriptInfo(dAdd)
  return getCallablesFromBinary(scriptInfo.script)
}

export const getCallablesFromBinary = async (binary: string): Promise<ReturnType> => {
  const { decompileScript } = wavesApi(config.testnet, axiosHttp(axios))
  const { script } = await decompileScript(binary)
  return getCallablesFromRide(script)
}


export const getCallablesFromRide = (code: string): ReturnType => {
  const extractMembers = (regex: RegExp): IContractFunction[] => {
    const callables = code.match(regex) ?? []
    return callables.map(x =>
    ({
      func: funcRegex.exec(x)!.groups!.name,
      args: funcRegex.exec(x)!.groups!.params.slice(1, -1).split(',').map(arg => {
        if (!arg) return undefined
        const [name, type] = arg.split(':').map(x => x.trim())
        return { name, type }
      }).filter(x => x),
    }))
  }

  const callables = extractMembers(callableRegex)
  const excludeFromFuncs = callables.map(x => x.func)
  const functions = extractMembers(functionRegex).filter(x => !excludeFromFuncs.includes(x.func))

  return {
    callables,
    functions,
  }
}

export const getMembers = async (dAppAddressOrFileOrCode: string): Promise<ReturnType> => {
  if (verifyAddress(dAppAddressOrFileOrCode)) {
    return getCallablesFromAddress(dAppAddressOrFileOrCode)
  }

  try {
    const sourcePath = resolve(process.cwd(), dAppAddressOrFileOrCode)
    const fileContent = readFileSync(sourcePath, { encoding: 'utf8' })
    return getCallablesFromRide(fileContent)
  } catch (error) {
  }

  try {

    if (dAppAddressOrFileOrCode.startsWith('http')) {
      const { data } = await axios.get(dAppAddressOrFileOrCode)
      return getCallablesFromRide(data)
    }
  } catch (error) {
  }

  return getCallablesFromRide(dAppAddressOrFileOrCode)
}