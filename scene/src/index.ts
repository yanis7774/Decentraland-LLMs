// We define the empty imports so the auto-complete feature works as expected.
import {Vector3} from '@dcl/sdk/math'
import {AudioSource, Entity, executeTask} from '@dcl/sdk/ecs'
import {getUserData} from '~system/UserIdentity'
import {connectionColyseus} from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import {setupUi} from './modules/ui_loader';
import {myNPC} from "./GameObjects/NPC";
import * as npc from "dcl-npc-toolkit-ai-version";
import { enablePlayerSound } from './utils/utils';
import { CustomPainting } from './modules/banner';
import { MusicBoombox } from './modules/boombox';


export function main() {
    // Defining behavior. See `src/systems.ts` file.
    executeTask(async () => {
        const data = await getUserData({});
        await connectionColyseus(data.data);

        setupUi();

        const npcEntity = myNPC

        const npc_data = npc.getData(npcEntity)

        console.log("npc_data", npc_data)

        //npc.showDebug(true)

        //let dialogWindow = npc.createDialogWindow()

        //npc.openDialogWindow(dialogWindow, NPCTalk, 0)


        // npc.followPath(myNPC, {
        //     path: [
        //         Vector3.create(8, 0, 8),   // Starting point (current position)
        //         Vector3.create(8, 0, 12),  // Midpoint (middle of the north)
        //         Vector3.create(8, 0, 16) ,  // Ending point (destination)
        //         Vector3.create(14, 0, 3)   // Ending point (destination)
        //     ]
        //
        //     ,
        //
        //     // path: [Vector3.create(2, 0, 2), Vector3.create(4, 0, 4), Vector3.create(6, 0, 6)],
        //     // loop: true,
        //     // speed: 100,
        //     // pathType: npc.NPCPathType.SMOOTH_PATH,
        //     onFinishCallback: () => {
        //         console.log('path is done')
        //     },
        //     onReachedPointCallback: () => {
        //         console.log('ending oint')
        //     },
        //     totalDuration: 10,
        // })




            // setTimeout(() => {
            //     npc.stopWalking(myNPC, 2, true)
            // }   , 2000)



        // npc.getData(npcEntity).faceUser = false


        new CustomPainting();
        new MusicBoombox();

        // setReceptionist(new ReceptionNpc(
        //     {
        //         position: {x: 5, y: -0.1, z: 5},
        //         scale: {x: 1.2, y: 1.1, z: 1.2},
        //         rotation: Quaternion.fromEulerDegrees(0, 0, 0)
        //     }
        // ))

        // const streamEntity = engine.addEntity()
        //
        // AudioStream.create(streamEntity, {
        //     url: "https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3",
        //     playing: true,
        //     volume: 0.8,
        // })


        // setTimeout(() => {
        //     AudioStream.getMutable(streamEntity).playing = false
        //
        // }, 5000)

        //

        // const sourceEntity = engine.addEntity()
        //
        // // Create AudioSource component
        // AudioSource.create(sourceEntity, {
        //     audioClipUrl: 'https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3',
        //     playing: true,
        // })
        //
        //
        //
        // // call function
        // playSound(sourceEntity)


    })

}

// Define a simple function
function playSound(entity: Entity) {
    // fetch mutable version of audio source component
    const audioSource = AudioSource.getMutable(entity)

    // modify its playing value
    audioSource.playing = true
}
