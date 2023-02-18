import { Command } from "@dcl/protocol/out-ts/decentraland/sdk/editor/commands.gen";
import { ExecuteCommandsRequest } from "@dcl/protocol/out-ts/decentraland/sdk/editor/data_service.gen";
import { Composite } from "@dcl/protocol/out-ts/decentraland/sdk/editor/project.gen";

export type DataServiceContext = {
    currentComposite: Composite

    undoList: Uint8Array[]
    redoList: Uint8Array[]
}

export type ProtobufCaseType<T> = T extends { $case: infer K } ? K : never
export type GenericProtobufCase<T, K extends ProtobufCaseType<T>> = T extends { $case: K } ? T : never
export type CommandHandler = (ctx: DataServiceContext, command: any) => Promise<void>

export type CommandCaseType = ProtobufCaseType<Command['command']>
export type CommandGeneric<K extends CommandCaseType> = GenericProtobufCase<Command['command'], K>

export type SingleBatchCaseType = ProtobufCaseType<ExecuteCommandsRequest['singleBatch']>
export type SingleBatchGeneric<K extends SingleBatchCaseType> = GenericProtobufCase<ExecuteCommandsRequest['singleBatch'], K>

