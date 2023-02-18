import { Command } from "@dcl/protocol/out-ts/decentraland/sdk/editor/commands.gen";
import { ExecuteCommandsRequest } from "@dcl/protocol/out-ts/decentraland/sdk/editor/data_service.gen";
import { Composite } from "@dcl/protocol/out-ts/decentraland/sdk/editor/project.gen";
import { deleteEntityRecursively, ensureEntityNodeComponent, findNextFreeEntity, getComponentOrNull } from "./entity-components";
import { CommandCaseType, CommandGeneric, CommandHandler, DataServiceContext } from "./types";

export async function handleCreateEntity(ctx: DataServiceContext, { createEntity: { parentId } }: CommandGeneric<'createEntity'>) {
    const entity = findNextFreeEntity(ctx)
    const EntityNodeComponent = ensureEntityNodeComponent(ctx)

    EntityNodeComponent.set(entity, {
        json: { parentId, name: '' }
    })
}

export async function handleDeleteEntity(ctx: DataServiceContext, { deleteEntity: { entityId } }: CommandGeneric<'deleteEntity'>) {
    deleteEntityRecursively(ctx, entityId)
}

export async function handleReparentEntity(ctx: DataServiceContext, { reparentEntity: { entityId, parentId } }: CommandGeneric<'reparentEntity'>) {
    const EntityNodeComponent = ensureEntityNodeComponent(ctx)

    const entityNode = EntityNodeComponent.get(entityId)
    if (!entityNode) {
        return
    }

    EntityNodeComponent.set(entityId, {
        json: {
            ...entityNode.json,
            parentId
        }
    })

}

export async function handleUpsertComponent(ctx: DataServiceContext, { upsertComponent: { componentName, componentValue, entityId } }: CommandGeneric<'upsertComponent'>) {
    const component = getComponentOrNull(ctx, componentName)
    if (component === null) {
        throw new Error(`Component ${componentName}`)
    }

    if (componentValue) {
        component.data.set(entityId, componentValue!)
    }
}

export async function handleDeleteComponent(ctx: DataServiceContext, { deleteComponent: { componentName, entityId } }: CommandGeneric<'deleteComponent'>) {
    const component = getComponentOrNull(ctx, componentName)
    if (component === null) {
        throw new Error(`Component ${componentName}`)
    }

    component.data.delete(entityId)
}

export const handlers: Record<CommandCaseType, CommandHandler> = {
    createEntity: handleCreateEntity,
    deleteEntity: handleDeleteEntity,
    reparentEntity: handleReparentEntity,
    upsertComponent: handleUpsertComponent,
    deleteComponent: handleDeleteComponent
}

export async function commandsHandler(ctx: DataServiceContext, commands: Command[]) {
    // Save the state before the changes
    const stateBeforeChanges = Composite.encode(ctx.currentComposite).finish()

    try {
        for (const command of commands) {
            if (command.command) {
                await handlers[command.command.$case](ctx, command.command)
            }
        }
    } catch (err) {
        // retore the state before the changes
        ctx.currentComposite = Composite.decode(stateBeforeChanges)
        throw err
    }

    // Here we are without errors
    ctx.undoList.push(stateBeforeChanges)
    ctx.redoList = []

}

export async function singleBatchHandler(ctx: DataServiceContext, singleBatch: ExecuteCommandsRequest['singleBatch']) {
    if (singleBatch === undefined) {
        return
    }

    if (singleBatch.$case === 'entityComponents') {
        await commandsHandler(ctx, singleBatch.entityComponents.batchCommands)
    } else if (singleBatch?.$case === 'undo') {
        const previousState = ctx.undoList.pop()

        if (previousState) {
            const currentState = Composite.encode(ctx.currentComposite).finish()
            ctx.redoList.push(currentState)
            ctx.currentComposite = Composite.decode(previousState)
        }
    } else if (singleBatch?.$case === 'redo') {
        const nextState = ctx.redoList.pop()

        if (nextState) {
            const currentState = Composite.encode(ctx.currentComposite).finish()
            ctx.undoList.push(currentState)
            ctx.currentComposite = Composite.decode(nextState)
        }
    }

}

export async function* executeCommands(req: AsyncIterable<ExecuteCommandsRequest>, ctx: DataServiceContext) {
    for await (const body of req) {
        try {
            await singleBatchHandler(ctx, body.singleBatch)

            yield {
                currentComposite: ctx.currentComposite,
                error: ''
            }
        } catch (err) {
            yield {
                currentComposite: ctx.currentComposite,
                error: Object(err).toString()
            }
        }
    }
}