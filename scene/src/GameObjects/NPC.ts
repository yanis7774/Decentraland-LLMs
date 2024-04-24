import * as npc from 'dcl-npc-toolkit-ai-version'
import {NPCBodyType} from "dcl-npc-toolkit-ai-version/dist/types";
import { isPreviewMode } from '~system/EnvironmentApi';
import { previewFileUrl, previewUrl, productionFileUrl, productionUrl } from '../modules/global';

export async function createNpc(model: string, configured: boolean, transform: any) {

    const isPreview = await isPreviewMode({});
    let ENDPOINT, FILE_SERVER

    ENDPOINT = (isPreview.isPreview)
        ? previewUrl // local environment
        : productionUrl; // production environment insert if needed
    FILE_SERVER = (isPreview.isPreview)
        ? previewFileUrl
        : productionFileUrl

    const NPC = npc.create(
        transform,
        //NPC Data Object
        {
            type: npc.NPCType.CUSTOM,
            body: NPCBodyType.MALE,
            model: model,
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
        },false,configured,ENDPOINT,"lobby_room",FILE_SERVER
    )
    return NPC
}