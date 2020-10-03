import { SuccessContract } from './SuccessContract'

export class ItemList extends SuccessContract {
  public constructor (items: any[], total: number) {
    super(items, total)
  }
}
