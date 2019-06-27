import axios from 'axios'
import { wavesApi, config, axiosHttp } from '@waves/waves-rest'
import { base58Decode, ChaidId, verifyAddress } from '@waves/waves-crypto'
import { path } from 'filenamify'
import { basename, resolve } from 'path'
import { writeFileSync, readFileSync } from 'fs'
import { createContractDefinition } from '.'

const callableRegex = /@Callable\s?.*?func\s+(?<name>\w+)\s?\((?<params>.*?)\)/gs
const funcRegex = /func\s+(?<name>[^\( ]*)\s?(?<params>\(.*?\))/

export interface IArg {
  name: string
  type?: string
}

export interface ICallable {
  func: string
  args: IArg[]
}

export const getCallablesFromAddress = async (dAdd: string): Promise<ICallable[]> => {
  const chainId = base58Decode(dAdd)[1]
  const conf = ChaidId.isMainnet(chainId) ? config.mainnet : config.testnet
  const { getScriptInfo } = wavesApi(conf, axiosHttp(axios))
  const scriptInfo = await getScriptInfo(dAdd)
  return getCallablesFromBinary(scriptInfo.script)
}

export const getCallablesFromBinary = async (binary: string): Promise<ICallable[]> => {
  const { decompileScript } = wavesApi(config.testnet, axiosHttp(axios))
  const { script } = await decompileScript(binary)
  return getCallablesFromRide(script)
}

export const getCallablesFromRide = (code: string): ICallable[] => {
  const m = code.match(callableRegex)!
  return m.map(x =>
    ({
      func: funcRegex.exec(x)!.groups!.name,
      args: funcRegex.exec(x)!.groups!.params.slice(1, -1).split(',').map(arg => {
        const [name, type] = arg.split(':').map(x => x.trim())
        return { name, type }
      }),
    }))
}

export const getCallables = async (dAppAddressOrFileOrCode: string): Promise<ICallable[]> => {
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