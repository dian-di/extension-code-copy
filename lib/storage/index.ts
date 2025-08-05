import type { Unwatch } from 'wxt/utils/storage'
import type { Perfer } from './types'
export type { Perfer }

const PREFER = 'sync:preference'

export async function getPerference() {
  const prefer = await storage.getItem<Perfer>(PREFER)
  const { user_name, user_logo } = prefer || {}
  return { user_name, user_logo }
}

export async function setPerference(data: Perfer) {
  await storage.setItem<Perfer>(PREFER, data)
}

export function watchPerference(cb: (newValue: Perfer) => void): Unwatch {
  return storage.watch<Perfer>(PREFER, (newValue) => newValue && cb(newValue))
}
