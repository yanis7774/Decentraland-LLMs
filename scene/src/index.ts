// We define the empty imports so the auto-complete feature works as expected.
import { executeTask } from '@dcl/sdk/ecs'
import { getUserData } from '~system/UserIdentity'
import {connectionColyseus} from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import {setupUi} from './modules/ui/ui_loader';
import { CustomPainting } from './modules/banner';
import { MusicBoombox } from './modules/boombox';
import { createNpc } from './GameObjects/NPC';
import { Quaternion, Vector3 } from '@dcl/sdk/math';


export function main() {

    executeTask(async () => {
        const data = await getUserData({});
        await connectionColyseus(data.data);

        setupUi();

        await createNpc('models/woman_Idle.glb',false,false,{
            position: Vector3.create(8, 0, 8),
            rotation: Quaternion.Zero(),
            scale: Vector3.create(1, 1, 1),
        }, "Ollama + Local Voice");
        await createNpc('models/hotel_boy_collider.glb',false,true,{
            position: Vector3.create(14, 0, 10),
            rotation: Quaternion.Zero(),
            scale: Vector3.create(1, 1, 1),
        }, "Configured OpenAI");
        await createNpc('models/hotel_boy_collider.glb',true,false,{
            position: Vector3.create(2, 0, 2),
            rotation: Quaternion.Zero(),
            scale: Vector3.create(1, 1, 1),
        }, "OpenAI + Rag");
        // set ollama
        new CustomPainting(true,Vector3.create(8, 2, 6));
        new CustomPainting(false,Vector3.create(12, 2, 6));

        new MusicBoombox(true,Vector3.create(8, 0.4, 13));
        new MusicBoombox(false,Vector3.create(4, 0.4, 13));

    })

}
