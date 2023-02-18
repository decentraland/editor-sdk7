
import { DataServiceDefinition } from '@dcl/protocol/out-ts/decentraland/sdk/editor/data_service.gen';
import { RpcServerPort } from '@dcl/rpc';
import * as codegen from '@dcl/rpc/dist/codegen';
import { executeCommands } from './commands';
import { DataServiceContext } from './types';


export function registerDataService(port: RpcServerPort<DataServiceContext>) {
    codegen.registerService(port, DataServiceDefinition, async () => ({
        async init(req, _ctx) {
            return {} as any
        },
        executeCommands
    }))
}
