import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { Scene } from '@babylonjs/core/scene'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { ToolPart, ToolSlot } from '../../domain/tools/types'

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
/** 五段（1–5）數值轉 0–1，供尺寸與顏色插值使用。 */
const norm = (value: number) => clamp01((value - 1) / 4)

/** 依零件 stats 決定每個部位的顏色，不寫死零件 id，未來新零件自動有合理外觀。 */
function statColor(low: string, high: string, amount: number): Color3 {
  return Color3.Lerp(Color3.FromHexString(low), Color3.FromHexString(high), amount)
}

function averageStat(parts: readonly ToolPart[], key: keyof ToolPart['stats']): number {
  if (parts.length === 0) return 3
  return parts.reduce((sum, part) => sum + part.stats[key], 0) / parts.length
}

function findSlot(parts: readonly ToolPart[], slot: ToolSlot): ToolPart | undefined {
  return parts.find((part) => part.slot === slot)
}

/**
 * 依組裝零件即時建立能量槍 3D 模型：每個插槽對應一個部位，
 * 尺寸與顏色由該零件（或全體平均，插槽缺件時）的七維數值決定，
 * 不綁定特定零件 id，新增零件會自動長出合理外觀。
 */
export function buildToolPreviewScene(
  engine: AbstractEngine,
  options: { parts: readonly ToolPart[]; reducedMotion: boolean },
): Scene {
  const scene = new Scene(engine)
  // 與工具卡底色一致（--c-surface: #fffdf7），讓畫布融入卡片而不用處理透明合成。
  scene.clearColor = new Color4(1, 253 / 255, 247 / 255, 1)

  const camera = new ArcRotateCamera('tool-preview-camera', -Math.PI / 2.6, Math.PI / 2.35, 4.6, new Vector3(0.3, 0.15, 0), scene)
  camera.minZ = 0.05
  scene.activeCamera = camera

  new HemisphericLight('tool-preview-ambient', new Vector3(0, 1, 0), scene).intensity = 0.75
  const sun = new DirectionalLight('tool-preview-sun', new Vector3(-0.5, -1, 0.3), scene)
  sun.intensity = 0.6

  const root = new TransformNode('tool-preview-root', scene)

  const { parts } = options
  const energy = findSlot(parts, 'energy')
  const emitter = findSlot(parts, 'emitter')
  const aimTube = findSlot(parts, 'aimTube')
  const grip = findSlot(parts, 'grip')
  const cooler = findSlot(parts, 'cooler')
  const helper = findSlot(parts, 'helper')

  // 能源盒：主體，省電越高越偏青綠、越低越偏琥珀。
  const energyStats = energy ?? parts[0]
  if (energyStats) {
    const power = norm(energyStats.stats.power)
    const saving = norm(energyStats.stats.saving)
    const box = MeshBuilder.CreateBox('tool-preview-energy', {
      width: 0.62 + power * 0.22,
      height: 0.5,
      depth: 0.5,
    }, scene)
    box.parent = root
    const material = new StandardMaterial('tool-preview-energy-material', scene)
    material.diffuseColor = statColor('#d99a3f', '#3f9d7a', saving)
    material.emissiveColor = material.diffuseColor.scale(0.15)
    box.material = material
  }

  // 發射頭：能源盒前方的錐形，力量越高越粗、耗電（1-省電）越高越紅。
  if (emitter) {
    const power = norm(emitter.stats.power)
    const heat = 1 - norm(emitter.stats.saving)
    const cone = MeshBuilder.CreateCylinder('tool-preview-emitter', {
      diameterTop: 0.14,
      diameterBottom: 0.26 + power * 0.16,
      height: 0.42 + norm(emitter.stats.range) * 0.18,
      tessellation: 16,
    }, scene)
    cone.rotation.z = Math.PI / 2
    cone.position.x = 0.55
    cone.parent = root
    const material = new StandardMaterial('tool-preview-emitter-material', scene)
    material.diffuseColor = statColor('#5f8fd4', '#d4544a', heat)
    material.emissiveColor = material.diffuseColor.scale(0.12)
    cone.material = material
  }

  // 瞄準管：從發射頭延伸出去的細管，距離越遠越長、瞄準越準越細。
  if (aimTube) {
    const length = 0.5 + norm(aimTube.stats.range) * 0.7
    const thin = norm(aimTube.stats.aim)
    const tube = MeshBuilder.CreateCylinder('tool-preview-aim-tube', {
      diameter: 0.16 - thin * 0.06,
      height: length,
      tessellation: 14,
    }, scene)
    tube.rotation.z = Math.PI / 2
    tube.position.x = 0.85 + length / 2
    tube.parent = root
    const material = new StandardMaterial('tool-preview-aim-tube-material', scene)
    material.diffuseColor = Color3.FromHexString('#c7ccd1')
    material.specularColor = Color3.Black()
    tube.material = material
  }

  // 握把：能源盒下方，越輕巧越窄小、越穩定（輕巧低）越厚實。
  if (grip) {
    const bulk = 1 - norm(grip.stats.lightness)
    const box = MeshBuilder.CreateBox('tool-preview-grip', {
      width: 0.2 + bulk * 0.1,
      height: 0.42 + bulk * 0.14,
      depth: 0.24,
    }, scene)
    box.position.set(-0.05, -0.42, 0)
    box.rotation.z = 0.18
    box.parent = root
    const material = new StandardMaterial('tool-preview-grip-material', scene)
    material.diffuseColor = Color3.FromHexString('#8a6a45')
    box.material = material
  }

  // 降溫盒：能源盒上方的散熱鰭片，片數依降溫數值（1–5 片）。
  if (cooler) {
    const finCount = Math.round(1 + norm(cooler.stats.cooling) * 4)
    const material = new StandardMaterial('tool-preview-cooler-material', scene)
    material.diffuseColor = Color3.FromHexString('#7fb7d9')
    material.emissiveColor = material.diffuseColor.scale(0.1)
    for (let index = 0; index < finCount; index += 1) {
      const fin = MeshBuilder.CreateBox(`tool-preview-fin-${index}`, { width: 0.06, height: 0.22, depth: 0.44 }, scene)
      fin.position.set(-0.18 + index * 0.09, 0.36, 0)
      fin.parent = root
      fin.material = material
    }
  }

  // 小幫手：繞著工具緩慢公轉的小球，愛地球分數越高越翠綠發光。
  let helperOrbit: { mesh: ReturnType<typeof MeshBuilder.CreateSphere>; radius: number } | undefined
  if (helper) {
    const care = norm(helper.stats.earthCare)
    const sphere = MeshBuilder.CreateSphere('tool-preview-helper', { diameter: 0.16, segments: 12 }, scene)
    sphere.parent = root
    const material = new StandardMaterial('tool-preview-helper-material', scene)
    material.diffuseColor = statColor('#b7c4cf', '#5eb987', care)
    material.emissiveColor = material.diffuseColor.scale(0.35)
    sphere.material = material
    helperOrbit = { mesh: sphere, radius: 0.85 }
  }

  const powerAverage = norm(averageStat(parts, 'power'))
  camera.radius = 4.2 - powerAverage * 0.5

  const still =
    options.reducedMotion ||
    (typeof navigator !== 'undefined' && navigator.webdriver === true)
  if (!still) {
    let elapsed = 0
    scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = Math.min(engine.getDeltaTime() / 1000, 0.05)
      elapsed += deltaSeconds
      root.rotation.y += deltaSeconds * 0.35
      if (helperOrbit) {
        const angle = elapsed * 1.1
        helperOrbit.mesh.position.set(
          Math.cos(angle) * helperOrbit.radius,
          0.1 + Math.sin(angle * 1.6) * 0.12,
          Math.sin(angle) * helperOrbit.radius,
        )
      }
    })
  } else if (helperOrbit) {
    helperOrbit.mesh.position.set(helperOrbit.radius, 0.1, 0)
  }

  return scene
}
