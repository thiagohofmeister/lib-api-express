import { SuccessContract } from './SuccessContract'

export class ItemDetailXML extends SuccessContract {
  public constructor (xml: string, public newItem: boolean = false) {
    super(xml)
  }
}
