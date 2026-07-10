import {
  chooseEnergyMode,
  cleanStormCore,
  createStormMachine,
  sortStormItem,
  type EnergyMode,
  type StormMachineState,
  type WasteKind,
} from '../../domain/boss/stormMachine'

type StormStateListener = (state: StormMachineState) => void

const copyState = (state: StormMachineState): StormMachineState => ({
  ...state,
  sortedItems: [...state.sortedItems],
  result: state.result ? { ...state.result } : undefined,
})

export class StormMachineController {
  private state = createStormMachine()
  private readonly onChange?: StormStateListener

  constructor(onChange?: StormStateListener) {
    this.onChange = onChange
  }

  snapshot(): StormMachineState {
    return copyState(this.state)
  }

  sort(item: WasteKind, bin: WasteKind): StormMachineState {
    this.state = sortStormItem(this.state, { item, bin })
    return this.publish()
  }

  cleanCore(): StormMachineState {
    this.state = cleanStormCore(this.state)
    return this.publish()
  }

  chooseEnergy(mode: EnergyMode): StormMachineState {
    this.state = chooseEnergyMode(this.state, mode)
    return this.publish()
  }

  private publish(): StormMachineState {
    const snapshot = this.snapshot()
    this.onChange?.(snapshot)
    return snapshot
  }
}
