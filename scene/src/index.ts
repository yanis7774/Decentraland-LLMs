// We define the empty imports so the auto-complete feature works as expected.
import {} from '@dcl/sdk/math'
import {executeTask} from '@dcl/sdk/ecs'
import {getUserData} from '~system/UserIdentity'
import {connectionColyseus} from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import {CustomPainting} from './modules/banner'
import {setupUi} from './modules/ui_loader';


export function main() {
    // Defining behavior. See `src/systems.ts` file.
    executeTask(async () => {
        const data = await getUserData({});
        await connectionColyseus(data.data);

        setupUi();
        new CustomPainting();
    })

}
