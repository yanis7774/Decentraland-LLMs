import * as npc from 'dcl-npc-toolkit-ai-version'
import {Dialog} from 'dcl-npc-toolkit-ai-version'
import {Quaternion, Vector3} from "@dcl/sdk/math";
import {NPCBodyType} from "dcl-npc-toolkit-ai-version/dist/types";
import { invokeInput } from '../modules/input_ui';
import { InputAction, MeshCollider, PointerEventType, PointerEvents, Transform, engine, inputSystem } from '@dcl/sdk/ecs';

npc.setCustomServerUrl("http://localhost:2574");

export let myNPC = npc.create(
    {
        position: Vector3.create(8, 0, 8),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(1, 1, 1),
    },
    //NPC Data Object
    {
        type: npc.NPCType.CUSTOM,
        body: NPCBodyType.MALE,
        model: 'images/woman_idle.glb',
        idleAnim: 'Idle',
        faceUser: true,
        turningSpeed: 10,
        onlyClickTrigger: true,
        //onlyExternalTrigger: true,

        onActivate: async (data) => {
            npc.initAiDialog(myNPC);
        },
        onWalkAway: async (data) => {
            //console.log('npc walkAway', data)
        }
    }
)


let pointerCollider = engine.addEntity()

MeshCollider.setBox(pointerCollider)
Transform.create(
    pointerCollider, 
    { 
        position: {x: 0, y: 1, z: 0.5},
        scale: {x: 1.4, y: 1.5, z: 1.8},
        parent: myNPC
    }
)

PointerEvents.create(
    pointerCollider,
    {pointerEvents: [
    {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
            button: InputAction.IA_POINTER,
            hoverText: `Talk`,
            maxDistance: 15
        }
    },
]})

engine.addSystem(()=>{
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, pointerCollider)) {
        npc.activate(myNPC,engine.PlayerEntity);
    }
});