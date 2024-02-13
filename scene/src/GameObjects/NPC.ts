import * as npc from 'dcl-npc-toolkit'
import {Dialog} from 'dcl-npc-toolkit'
import {Quaternion, Vector3} from "@dcl/sdk/math";
import {NPCBodyType} from "dcl-npc-toolkit/dist/types";
import {getUserData} from "~system/UserIdentity";
import {extractName} from "../utils/utils";

export let NPCTalk: Dialog[] = [
    {
        text: 'Hi there',
    },

    {
        text: 'It sure is nice talking to you',
    },

    {
        text: 'I must go, my planet needs me',
        isEndOfDialog: true,
    },
]

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
        // faceUser: true,
        turningSpeed: 10,
        onlyClickTrigger: true,
        onlyExternalTrigger: true,

        onActivate: async (data) => {
            console.log('npc activated', data)
            let userData = await getUserData({})
            console.log("userData.data", userData.data)

            // @ts-ignore
            const name = extractName(userData.data.displayName);
            console.log(name);
        },
    }
)

