import { Component } from "@dcl/protocol/out-ts/decentraland/sdk/editor/project.gen"

export const EntityNodeComponentName = 'core::entity-node'
export const EntityNodeJsonSchema = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "serializationType": "utf8-string"
        },
        "parentId": {
            "type": "integer",
            "serializationType": "entity"
        }
    },
    "serializationType": "map"
}
export type EntityNodeType = {
    name: '',
    parentId: number
}
export interface EntityNodeComponent extends Component {
    data: Map<number, { json: EntityNodeType }>
}
