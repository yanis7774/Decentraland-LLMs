import * as npc from 'dcl-npc-toolkit-ai-version'
import {Quaternion, Vector3} from "@dcl/sdk/math";
import {NPCBodyType} from "dcl-npc-toolkit-ai-version/dist/types";
import { isPreviewMode } from '~system/EnvironmentApi';
import { previewUrl, productionUrl } from '../modules/global';

export async function createNpc() {

    const isPreview = await isPreviewMode({});
    let ENDPOINT

    ENDPOINT = (isPreview.isPreview)
        ? previewUrl // local environment
        : productionUrl; // production environment insert if needed

    const NPC = npc.create(
        {
            position: Vector3.create(8, 0, 8),
            rotation: Quaternion.Zero(),
            scale: Vector3.create(1, 1, 1),
        },
        //NPC Data Object
        {
            type: npc.NPCType.CUSTOM,
            body: NPCBodyType.MALE,
            model: 'images/woman_Idle.glb',
            idleAnim: 'Idle',
            faceUser: true,
            turningSpeed: 10,
            onlyClickTrigger: true,
            //onlyExternalTrigger: true,

            onActivate: async (data) => {
                npc.initAiDialog(NPC);
            },
            onWalkAway: async (data) => {
                //console.log('npc walkAway', data)
            }
        },false,ENDPOINT
    )
    return NPC
}