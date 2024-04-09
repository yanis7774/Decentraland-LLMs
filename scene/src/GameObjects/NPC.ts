import * as npc from 'dcl-npc-toolkit-ai-version'
import {Quaternion, Vector3} from "@dcl/sdk/math";
import {NPCBodyType} from "dcl-npc-toolkit-ai-version/dist/types";

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
    },false,"http://localhost:2574"
)