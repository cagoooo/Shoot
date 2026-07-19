export interface ChallengeResult {
  missionId: string
  seconds: number
  previousBest?: number
  isNewRecord: boolean
  /** 比前一次最佳快幾秒（正數＝更快）；無前次紀錄時為 undefined。 */
  fasterBy?: number
}

/** 比較本次用時與先前最佳，回傳是否破紀錄與快了幾秒。 */
export function evaluateChallenge(
  missionId: string,
  seconds: number,
  previousBest?: number,
): ChallengeResult {
  if (previousBest === undefined) {
    return { missionId, seconds, isNewRecord: true }
  }
  if (seconds < previousBest) {
    return {
      missionId,
      seconds,
      previousBest,
      isNewRecord: true,
      fasterBy: Math.round(previousBest - seconds),
    }
  }
  return { missionId, seconds, previousBest, isNewRecord: false }
}

export function formatChallengeLine(result: ChallengeResult): string {
  const time = `${Math.round(result.seconds)} 秒`
  if (result.previousBest === undefined) {
    return `⏱️ 這次用了 ${time}，這是你的第一個紀錄！`
  }
  if (result.isNewRecord && result.fasterBy !== undefined) {
    return `🏆 新紀錄！這次 ${time}，比上次快了 ${result.fasterBy} 秒！`
  }
  return `⏱️ 這次用了 ${time}；你的最佳紀錄是 ${Math.round(result.previousBest)} 秒，再挑戰看看！`
}
