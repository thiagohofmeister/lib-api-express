export abstract class ViewContract<TDomainModel, TResponseModel> {
  abstract render(entity: TDomainModel): TResponseModel

  public renderMany(entities: TDomainModel[]): TResponseModel[] {
    return entities.map(entity => this.render(entity))
  }
}
