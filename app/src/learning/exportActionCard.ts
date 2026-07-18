import { badgeDetails, type LearningBadge } from './badges'
import type { LearningReport } from './events'

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export function createActionCardSvg(
  report: LearningReport,
  badges: readonly LearningBadge[],
): string {
  const badgeNames = badges.length
    ? badges.map((badge) => badgeDetails[badge].name).join('・')
    : '持續練習中'
  const reflection = report.reflections.at(-1) ?? '下次想試試更節能的方法'
  const recycled = Object.values(report.recycledByCategory).reduce(
    (sum, amount) => sum + amount,
    0,
  )
  const golden = report.perfectEndings > 0
  const frameColor = golden ? '#c8940f' : '#174f3c'
  const backgroundColor = golden ? '#fdf6e0' : '#eef7ef'
  const title = golden ? '⭐ 完美永續行動卡 ⭐' : '我的永續行動卡'
  const stars = golden
    ? `<text x="1040" y="130" font-size="44">🌟</text>
  <text x="980" y="112" font-size="30">✨</text>
  <text x="1096" y="168" font-size="28">✨</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${backgroundColor}"/>
  <rect x="44" y="44" width="1112" height="542" rx="34" fill="#fffdf5" stroke="${frameColor}" stroke-width="${golden ? 12 : 8}"/>
  ${golden ? '<rect x="60" y="60" width="1080" height="510" rx="26" fill="none" stroke="#e8c766" stroke-width="3"/>' : ''}
  ${stars}
  <text x="90" y="130" font-size="48" font-weight="800" fill="${golden ? '#8a5b00' : '#174f3c'}">${title}</text>
  <text x="90" y="205" font-size="30" fill="#253c34">能源使用：${report.energyUsed}</text>
  <text x="90" y="255" font-size="30" fill="#253c34">整理回收物：${recycled} 件</text>
  <text x="90" y="305" font-size="30" fill="#253c34">修好設備：${report.repairedMachines.length} 項</text>
  <text x="90" y="380" font-size="28" font-weight="700" fill="#8a5b00">獲得徽章：${escapeXml(badgeNames)}</text>
  ${report.endings.at(-1) ? `<text x="90" y="415" font-size="22" fill="#3d5c50">${escapeXml(report.endings.at(-1)!)}</text>` : ''}
  <rect x="78" y="425" width="1044" height="112" rx="20" fill="#dff2e5"/>
  <text x="104" y="473" font-size="24" font-weight="700" fill="#174f3c">下次想怎麼改：</text>
  <text x="104" y="515" font-size="25" fill="#253c34">${escapeXml(reflection)}</text>
  <text x="910" y="560" font-size="20" fill="#4d685e">SDGs 地球守護隊</text>
</svg>`
}
