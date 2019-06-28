#!/usr/bin/env node

import { createContractDefinition } from './create-definition'
import { resolve, basename } from 'path'
import { getCallables } from './get-callables'
import { writeFileSync } from 'fs'
import { verifyAddress } from '@waves/waves-crypto'

export const createDefinition = async (dAppAddressOrFileOrCode: string, path: string) => {
  const p = resolve(process.cwd(), path)
  const name = basename(p).split('.')[0]
  const callables = await getCallables(dAppAddressOrFileOrCode)
  writeFileSync(p, createContractDefinition(name, callables, verifyAddress(dAppAddressOrFileOrCode) ? dAppAddressOrFileOrCode : undefined))
  console.log(p)
}

const args = process.argv.slice(process.argv.length - 2)
createDefinition(args[0], args[1])

