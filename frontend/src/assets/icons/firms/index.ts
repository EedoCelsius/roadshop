const firmIconModules = import.meta.glob('./*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const buildKey = (path: string) => {
  const segments = path.split('/')
  const filename = segments[segments.length - 1] ?? ''
  return filename.replace('.svg', '')
}

const firmIconMap = Object.entries(firmIconModules).reduce<Record<string, string>>((acc, [path, value]) => {
  const key = buildKey(path)
  acc[key] = value
  acc[key.replace(/\s+/g, '')] = value
  return acc
}, {})

export const firmIcons = firmIconMap

export const getFirmIcon = (name: string): string | undefined => {
  const trimmed = name.trim()
  if (!trimmed) {
    return undefined
  }

  return firmIconMap[trimmed] ?? firmIconMap[trimmed.replace(/\s+/g, '')]
}
