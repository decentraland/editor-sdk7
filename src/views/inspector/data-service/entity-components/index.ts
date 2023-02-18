import { Component } from "@dcl/protocol/out-ts/decentraland/sdk/editor/project.gen"
import { EntityNodeComponent, EntityNodeComponentName, EntityNodeJsonSchema } from "./entity-node"
import { DataServiceContext } from "../types"

export const FIRST_ENTITY_NUMBER = 512

export function findNextFreeEntity(ctx: DataServiceContext) {
    const usedEntities: number[] = []
    for (const comp of ctx.currentComposite.components) {
        for (const entity of comp.data.keys()) {
            usedEntities.push(entity)
        }
    }

    // There is no entity 
    if (usedEntities.length === 0) return FIRST_ENTITY_NUMBER

    // Sort ascending
    usedEntities.sort()
    for (let i = 1; i < usedEntities.length; i++) {
        const currentEntity = usedEntities[i]
        const nextNumericEntityToPreviousEntity = usedEntities[i - 1] + 1

        // Current entity is the 
        if (currentEntity > nextNumericEntityToPreviousEntity) {
            return nextNumericEntityToPreviousEntity
        }
    }

    // The used entities array is sorted and without free entities between each other
    return usedEntities[usedEntities.length - 1] + 1
}


export function ensureEntityNodeComponent(ctx: DataServiceContext) {
    const comp: Component | null = getComponentOrNull(ctx, EntityNodeComponentName)
    if (comp) {
        return (comp as EntityNodeComponent).data
    }

    const newComp = {
        name: EntityNodeComponentName,
        jsonSchema: EntityNodeJsonSchema,
        data: new Map()
    }
    ctx.currentComposite.components.push(newComp)
    return (newComp as EntityNodeComponent).data
}

export function getComponentOrNull(ctx: DataServiceContext, name: string) {
    for (const comp of ctx.currentComposite.components) {
        if (comp.name === name) {
            return comp
        }
    }
    return null
}

export function deleteEntityRecursively(ctx: DataServiceContext, entityId: number) {
    const EntityNodeComponent = ensureEntityNodeComponent(ctx)

    const entityNode = EntityNodeComponent.get(entityId)
    if (!entityNode) {
        return
    }

    function addEntityToList(
        entityId: number,
        treeLevel: number,
        childrenEntities: {
            entityId: number
            treeLevel: number
        }[]
    ) {
        childrenEntities.push({ entityId, treeLevel })
        for (const [childEntityId, value] of EntityNodeComponent.entries()) {
            if (value.json.parentId === entityId) {
                addEntityToList(childEntityId, treeLevel, childrenEntities)
            }
        }
        return childrenEntities
    }

    const allEntities = addEntityToList(entityId, 0, []).sort((a, b) => b.treeLevel - a.treeLevel)
    for (const { data: componentData } of ctx.currentComposite.components.values()) {
        for (const { entityId } of allEntities) {
            componentData.delete(entityId)
        }
    }
}