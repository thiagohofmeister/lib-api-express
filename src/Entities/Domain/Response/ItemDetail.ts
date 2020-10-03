import { SuccessContract } from './SuccessContract'

export class ItemDetail extends SuccessContract {
  public constructor (item: any = null, public newItem: boolean = false) {
    super(item)
  }
}
