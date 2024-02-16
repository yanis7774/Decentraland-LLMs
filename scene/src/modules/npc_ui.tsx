import ReactEcs, {UiEntity} from "@dcl/sdk/react-ecs"
import {targetHeight, targetWidth} from "./UIGlobals"
import { NpcUtilsUi } from "dcl-npc-toolkit-ai-version"

export const npcUI = () => {
    return (
        <UiEntity
            uiTransform={{
                positionType: 'absolute',
                width: targetWidth,
                height: targetHeight,
                position: {top: '0%', left: '0%'},
                display: 'flex'
            }}
        >
            <NpcUtilsUi/>
        </UiEntity>
    )
}
