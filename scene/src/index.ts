// We define the empty imports so the auto-complete feature works as expected.
import { executeTask } from '@dcl/sdk/ecs'
import { getUserData } from '~system/UserIdentity'
import {connectionColyseus} from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import {setupUi} from './modules/ui_loader';
import { CustomPainting } from './modules/banner';
import { MusicBoombox } from './modules/boombox';
import { setConfiguredNpc, setReceptionist } from './modules/global';
import { createNpc } from './GameObjects/NPC';
import { Quaternion, Vector3 } from '@dcl/sdk/math';


export function main() {

    executeTask(async () => {
        const data = await getUserData({});
        await connectionColyseus(data.data);

        setupUi();

        setReceptionist(await createNpc('images/woman_Idle.glb',false,{
            position: Vector3.create(8, 0, 8),
            rotation: Quaternion.Zero(),
            scale: Vector3.create(1, 1, 1),
        }));
        setConfiguredNpc(await createNpc('images/hotel_boy_1.glb',true,{
            position: Vector3.create(2, 0, 2),
            rotation: Quaternion.Zero(),
            scale: Vector3.create(1, 1, 1),
        }));
        new CustomPainting();
        new MusicBoombox();

    })

}