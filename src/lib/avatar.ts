/**
 * Generate a consistent gradient and initials from a user's name.
 * Used for the top-bar avatar when no photo is available.
 */

const GRADIENTS = [
  'from-rose-400 to-orange-400',
  'from-orange-400 to-amber-400',
  'from-amber-400 to-yellow-400',
  'from-emerald-400 to-teal-400',
  'from-teal-400 to-cyan-400',
  'from-cyan-400 to-sky-400',
  'from-sky-400 to-blue-400',
  'from-blue-400 to-indigo-400',
  'from-indigo-400 to-violet-400',
  'from-violet-400 to-purple-400',
  'from-purple-400 to-fuchsia-400',
  'from-fuchsia-400 to-pink-400',
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function getAvatarGradient(name: string): string {
  const index = hashString(name || 'A') % GRADIENTS.length
  return GRADIENTS[index]
}

export function getInitials(name: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
