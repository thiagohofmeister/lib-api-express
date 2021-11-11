export class ProviderResponse<TPayload = any> {
  constructor(private statusCode: number, private payload: TPayload) {}

  public getStatusCode(): number {
    return this.statusCode
  }

  public getPayload(): TPayload {
    return this.payload
  }
}
