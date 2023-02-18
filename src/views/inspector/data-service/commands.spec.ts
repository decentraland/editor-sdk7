import { Command } from '@dcl/protocol/out-ts/decentraland/sdk/editor/commands.gen';
import { ComponentData } from '@dcl/protocol/out-ts/decentraland/sdk/editor/project.gen';
import { commandsHandler, executeCommands, handleCreateEntity } from './commands';
import { getComponentOrNull } from './entity-components';
import { EntityNodeComponentName } from './entity-components/entity-node';
import { DataServiceContext } from './types';

/********************************************************
                          Mocks
*********************************************************/


/********************************************************
                          Helper functions
*********************************************************/

function createCreateEntity(parentId: number): Command {
    return { command: { $case: 'createEntity', createEntity: { parentId } } };
}

function createDeleteEntity(entityId: number): Command {
    return { command: { $case: 'deleteEntity', deleteEntity: { entityId } } };
}

function createReparentEntity(entityId: number, parentId: number): Command {
    return {
        command: { $case: 'reparentEntity', reparentEntity: { entityId, parentId } },
    };
}

function createUpsertComponent(
    componentName: string,
    entityId: number,
    componentValue: ComponentData | undefined,
): Command {
    return {
        command: {
            $case: 'upsertComponent',
            upsertComponent: { componentName, entityId, componentValue },
        },
    };
}

function createDeleteComponent(componentName: string, entityId: number): Command {
    return {
        command: { $case: 'deleteComponent', deleteComponent: { componentName, entityId } },
    };
}

function initNewContext(): DataServiceContext {
    return {
        currentComposite: {
            components: [],
            readonly: false
        },
        redoList: [],
        undoList: []
    }
}

/********************************************************
                          Tests
*********************************************************/

describe('commands', () => {
    beforeEach(() => { })
    afterEach(() => { })

    describe('', () => {
        it('test 1', async () => {
            const ctx = initNewContext()
            const firstCommands: Command[] = [
                createCreateEntity(0),
                createCreateEntity(0),
                createCreateEntity(512),
                createCreateEntity(512),
                createCreateEntity(512),
                createCreateEntity(513)
            ]

            await commandsHandler(ctx, firstCommands)

            const EntityNodeComponent = getComponentOrNull(ctx, EntityNodeComponentName)
            expect(EntityNodeComponent).not.toBeNull()

            expect(Array.from(EntityNodeComponent!.data.entries()))
                .toStrictEqual([
                    [512, { json: { parentId: 0, name: '' } }],
                    [513, { json: { parentId: 0, name: '' } }],
                    [514, { json: { parentId: 512, name: '' } }],
                    [515, { json: { parentId: 512, name: '' } }],
                    [516, { json: { parentId: 512, name: '' } }],
                    [517, { json: { parentId: 513, name: '' } }]
                ])
            console.log(ctx.currentComposite)
        })
    })
})
