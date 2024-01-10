// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion } from '@dcl/sdk/math'
import {executeTask} from '@dcl/sdk/ecs'
import {getUserData} from '~system/UserIdentity'
import {connectionColyseus} from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import {CustomPainting} from './modules/banner'
import {setupUi} from './modules/ui_loader';
import { setReceptionist } from './modules/global';
import { ReceptionNpc } from './modules/npc';


export function main() {
    // Defining behavior. See `src/systems.ts` file.
    executeTask(async () => {
        const data = await getUserData({});
        await connectionColyseus(data.data);

        setupUi();
        //new CustomPainting();
        setReceptionist(new ReceptionNpc(
            {
                position: {x: 5, y: -0.1, z: 5},
                scale: {x: 1.2, y: 1.1, z: 1.2},
                rotation: Quaternion.fromEulerDegrees(0, 0, 0)
            }
        ))
    })

}
