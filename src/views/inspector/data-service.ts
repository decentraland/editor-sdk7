
import { RpcServerPort } from '@dcl/rpc'
import * as codegen from '@dcl/rpc/dist/codegen'
import { DataServiceDefinition } from './protocol/services.gen'

export function registerDataService(port: RpcServerPort<{}>) {
    codegen.registerService(port, DataServiceDefinition, async () => ({
        async init(req, _ctx) {
            return {
                components: [],
                assets: [],
                state: new Uint8Array()
            }
        }
    }))
}
