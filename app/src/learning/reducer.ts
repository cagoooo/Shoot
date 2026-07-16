import type { LearningEvent, LearningReport } from './events'

const addUnique = (values: string[], value: string): string[] =>
  values.includes(value) ? values : [...values, value]

export function createEmptyLearningReport(): LearningReport {
  return {
    energyUsed: 0,
    recycledByCategory: {},
    repairedMachines: [],
    protectedTargets: [],
    selectedParts: [],
    reflections: [],
    enemiesCleansed: 0,
    energyModes: [],
    routes: [],
    endings: [],
  }
}

export function reduceLearningEvents(
  events: readonly LearningEvent[],
): LearningReport {
  return events.reduce<LearningReport>((report, event) => {
    switch (event.type) {
      case 'energy-used':
        return { ...report, energyUsed: report.energyUsed + Math.max(0, event.amount) }
      case 'material-recycled':
        return {
          ...report,
          recycledByCategory: {
            ...report.recycledByCategory,
            [event.category]:
              (report.recycledByCategory[event.category] ?? 0) +
              Math.max(0, event.amount),
          },
        }
      case 'machine-repaired':
        return {
          ...report,
          repairedMachines: addUnique(report.repairedMachines, event.id),
        }
      case 'protected-target':
        return {
          ...report,
          protectedTargets: addUnique(report.protectedTargets, event.id),
        }
      case 'part-selected':
        return {
          ...report,
          selectedParts: addUnique(report.selectedParts, event.partId),
        }
      case 'reflection-chosen':
        return {
          ...report,
          reflections: addUnique(report.reflections, event.choice),
        }
      case 'enemy-cleansed':
        return {
          ...report,
          enemiesCleansed: report.enemiesCleansed + Math.max(0, event.amount),
        }
      case 'energy-mode':
        return report.energyModes.includes(event.mode)
          ? report
          : { ...report, energyModes: [...report.energyModes, event.mode] }
      case 'route-chosen':
        return report.routes.includes(event.route)
          ? report
          : { ...report, routes: [...report.routes, event.route] }
      case 'mission-ending':
        return { ...report, endings: addUnique(report.endings, event.summary) }
    }
  }, createEmptyLearningReport())
}
