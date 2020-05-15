export abstract class SuccessContract {
  protected constructor(public items?: any, public total?: number) {}
}

export class ItemList extends SuccessContract {
  public constructor (items: any[], total: number) {
    super(items, total)
  }
}

export class ItemDetail extends SuccessContract {
  public constructor (item: any = null, public newItem: boolean = false) {
    super(item)
  }
}
