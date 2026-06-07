/**
 * Generate a consistent gradient and initials from a user's name.
 * Used for the top-bar avatar when no photo is available.
 */

const GRADIENTS = [
  'linear-gradient(135deg, #fb7185 0%, #fb923c 100%)',   // rose-400 -> orange-400
  'linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)',   // orange-400 -> amber-400
  'linear-gradient(135deg, #fbbf24 0%, #facc15 100%)',   // amber-400 -> yellow-400
  'linear-gradient(135deg, #34d399 0%, #2dd4bf 100%)',   // emerald-400 -> teal-400
  'linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%)',   // teal-400 -> cyan-400
  'linear-gradient(135deg, #22d3ee 0%, #38bdf8 100%)',   // cyan-400 -> sky-400
  'linear-gradient(135deg, #38bdf8 0%, #60a5fa 100%)',   // sky-400 -> blue-400
  'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',   // blue-400 -> indigo-400
  'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',   // indigo-400 -> violet-400
  'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',   // violet-400 -> purple-400
  'linear-gradient(135deg, #c084fc 0%, #e879f9 100%)',   // purple-400 -> fuchsia-400
  'linear-gradient(135deg, #e879f9 0%, #f472b6 100%)',   // fuchsia-400 -> pink-400
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
