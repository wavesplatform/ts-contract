#!/usr/bin/env node

import { createContractDefinition } from './create-definition'
import { resolve, basename } from 'path'
import { getMembers } from './getMembers'
import { writeFileSync } from 'fs'
import { verifyAddress } from '@waves/ts-lib-crypto'

const snakeToCamel = (str: string) => {
  if (!(/[_-]/).test(str)) return str

  return str.toLowerCase()
    .replace(/([-_])([a-z])/g, (_match, _p1, p2) => p2.toUpperCase())
}

export const createDefinition = async (dAppAddressOrFileOrCode: string, path: string, ...args: string[]) => {


  const p = resolve(process.cwd(), path)
  const name = basename(p).split('.')[0]
  const { callables, functions } = await getMembers(dAppAddressOrFileOrCode)

  const members = callables.concat(functions.filter(x =>
    x.func.toLowerCase().includes('advise') ||
    x.func.toLowerCase().includes('debug')
  ))

  writeFileSync(p, createContractDefinition(snakeToCamel(name), members, verifyAddress(dAppAddressOrFileOrCode) ? dAppAddressOrFileOrCode : undefined))
  console.log(p)
}

const args = process.argv.slice(process.argv.length - 2)

createDefinition(args[0], args[1])

