import type { StudentStats, ToolPart, ToolResult } from './types'

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

function clampStudentScore(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)))
}

export function calculateTool(parts: ToolPart[]): ToolResult {
  if (parts.length === 0) {
    throw new Error('tool_requires_parts')
  }

  const slots = new Set<string>()
  for (const part of parts) {
    if (slots.has(part.slot)) {
      throw new Error(`duplicate_tool_slot: ${part.slot}`)
    }
    slots.add(part.slot)
  }

  const average = (key: keyof StudentStats) =>
    parts.reduce((sum, part) => sum + part.stats[key], 0) / parts.length

  const averages: StudentStats = {
    power: average('power'),
    saving: average('saving'),
    range: average('range'),
    aim: average('aim'),
    cooling: average('cooling'),
    lightness: average('lightness'),
    earthCare: average('earthCare'),
  }

  const studentStats: StudentStats = {
    power: clampStudentScore(averages.power),
    saving: clampStudentScore(averages.saving),
    range: clampStudentScore(averages.range),
    aim: clampStudentScore(averages.aim),
    cooling: clampStudentScore(averages.cooling),
    lightness: clampStudentScore(averages.lightness),
    earthCare: clampStudentScore(averages.earthCare),
  }

  return {
    studentStats,
    power: roundToTenth(averages.power * 20),
    energyPerShot: roundToTenth(
      Math.max(1, 12 - averages.saving + averages.power * 0.2),
    ),
    heatPerShot: roundToTenth(
      Math.max(1, 4 + averages.power - averages.cooling),
    ),
  }
}
