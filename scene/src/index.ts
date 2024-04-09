// We define the empty imports so the auto-complete feature works as expected.
import { executeTask } from '@dcl/sdk/ecs'
import { getUserData } from '~system/UserIdentity'
import {connectionColyseus} from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import {setupUi} from './modules/ui_loader';
import { CustomPainting } from './modules/banner';
import { MusicBoombox } from './modules/boombox';
import { setReceptionist } from './modules/global';
import { createNpc } from './GameObjects/NPC';


export function main() {

    executeTask(async () => {
        const data = await getUserData({});
        await connectionColyseus(data.data);

        setupUi();

        setReceptionist(createNpc());
        new CustomPainting();
        new MusicBoombox();

    })

}