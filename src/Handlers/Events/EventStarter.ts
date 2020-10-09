import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import * as socketio from 'socket.io'
import { NextFunction, Response } from 'express'
import { IRequest } from '../Interfaces'

export class EventStarter {
  private io: IRequest['eventIO']
  private connectedUsers: IRequest['eventIOConnectedUsers'] = {}

  constructor (
    readonly server: HttpServer | HttpsServer
  ) {
    this.io = socketio(server)

    this.io.on('connection', socket => {
      const { user } = socket.handshake.query
      this.connectedUsers[user] = socket.id
      console.log('Client connected:', user)
    })

    this.handler = this.handler.bind(this)
  }

  public handler (request: IRequest, response: Response, next: NextFunction) {
    request.eventIO = this.io
    request.eventIOConnectedUsers = this.connectedUsers

    next()
  }
}