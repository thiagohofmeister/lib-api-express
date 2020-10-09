import { IMessagePayload } from './IMessagePayload'

export interface IMessage {
  identifier: string
  payload: IMessagePayload
}