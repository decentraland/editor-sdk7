
import { RpcServerPort } from '@dcl/rpc'
import * as codegen from '@dcl/rpc/dist/codegen'
import { DataServiceDefinition } from '@dcl/protocol/out-ts/decentraland/sdk/editor/data_service.gen'

export function registerDataService(port: RpcServerPort<{}>) {
    codegen.registerService(port, DataServiceDefinition, async () => ({
        async init(req, _ctx) {
            return {} as any
        }
    }))
}
