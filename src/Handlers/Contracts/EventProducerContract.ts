import { IMessage } from '../Interfaces/Events/IMessage'

export class EventProducerContract {
  constructor (private eventIO: any, private connectedUsers: any) {
  }

  public send (userId: string, message: IMessage): boolean {
    if (!this.connectedUsers[userId]) return false

    this.eventIO.to(this.connectedUsers[userId]).emit(message.identifier, message.payload)

    return true
  }
}