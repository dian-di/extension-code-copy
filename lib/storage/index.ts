import type { Unwatch } from 'wxt/utils/storage'
import type { Perfer } from './types'
export type { Perfer }

const PREFER = 'sync:preference'
const LOCAL_LANG = 'local:language'

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

export async function getLanguage() {
  const lang = await storage.getItem<string>(LOCAL_LANG)
  console.log(lang, 'lang')
  return lang || ''
}

export async function setLanguage(language: string) {
  await storage.setItem<string>(LOCAL_LANG, language)
}
