import { nanoid, customAlphabet } from 'nanoid'

const nanoidGenerator = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 32)

export function generateApiKey(prefix: string = 'esk_live_'): { fullKey: string; maskedKey: string; hashedKey: string } {
  const randomPart = nanoidGenerator()
  const fullKey = `${prefix}${randomPart}`
  const maskedKey = `${prefix}${'•'.repeat(24)}`
  
  return {
    fullKey,
    maskedKey,
    hashedKey: randomPart
  }
}

export function maskApiKey(key: string, prefix: string): string {
  const parts = key.split('_')
  if (parts.length >= 3) {
    return `${parts[0]}_${parts[1]}_${'•'.repeat(24)}`
  }
  return `${prefix}${'•'.repeat(24)}`
}

export function formatApiKeyDisplay(key: string, showFull: boolean = false): string {
  if (showFull) return key
  const prefix = key.startsWith('esk_live_') ? 'esk_live_' : key.startsWith('esk_test_') ? 'esk_test_' : ''
  return maskApiKey(key, prefix)
}
