import { RpcServer, RpcServerPort, Transport } from '@dcl/rpc'
import { createRpcServer } from '@dcl/rpc/dist/server'
import { WebSocketTransport } from '@dcl/rpc/dist/transports/WebSocket'
import path from 'path'
import { WebSocketServer } from 'ws'
import { getExtensionPath } from '../../modules/path'
import { Server, StaticServer } from '../../modules/server'
import { ServerName } from '../../types'
import { registerDataService } from './data-service'

export const inspectorServer = new StaticServer(ServerName.Inspector, () =>
  path.join(
    getExtensionPath(),
    './node_modules/@dcl/inspector/build'
  )
)

export type InspectorContext = {}

class InspectorRpcServer extends Server {
  rpcServer: RpcServer<InspectorContext>
  webSocketServer: WebSocketServer | null = null

  constructor() {
    super(ServerName.InspectorRpc)
    this.rpcServer = createRpcServer({})
    this.rpcServer.setHandler(this.rpcHandler)
  }

  private async rpcHandler(serverPort: RpcServerPort<InspectorContext>, transport: Transport, context: {}) {
    registerDataService(serverPort)
  }


  async onStop() {
    if (this.webSocketServer) {
      this.webSocketServer.close()
      this.webSocketServer = null
    }
  }

  async onStart(): Promise<void> {
    const port = await this.getPort()
    this.webSocketServer = new WebSocketServer({
      port
    })

    this.webSocketServer!.on('connection', (socket, request) => {
      const wsTransport = WebSocketTransport(socket as any)
      this.rpcServer.attachTransport(wsTransport, {})
    })
  }

}

export const inspectorRpcServer = new InspectorRpcServer()