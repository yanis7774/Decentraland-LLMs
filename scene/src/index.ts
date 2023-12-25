// We define the empty imports so the auto-complete feature works as expected.
import { } from '@dcl/sdk/math'
import { Animator, AudioSource, AvatarAttach, GltfContainer, Material, Transform, VideoPlayer, VisibilityComponent, engine, executeTask, pointerEventsSystem } from '@dcl/sdk/ecs'
//import { initAssetPacks } from '@dcl/asset-packs/dist/scene-entrypoint'
import { getUserData } from '~system/UserIdentity'
import { connectionColyseus } from './modules/connection'
import "./modules/compatibility/polyfill/declares";
import { CustomPainting } from './modules/banner'
import { setupUi } from './modules/ui_loader';

// // You can remove this if you don't use any asset packs
// initAssetPacks(engine, pointerEventsSystem, {
//   Animator,
//   AudioSource,
//   AvatarAttach,
//   Transform,
//   VisibilityComponent,
//   GltfContainer,
//   Material,
//   VideoPlayer
// })

export function main() {
  // Defining behavior. See `src/systems.ts` file.
  executeTask(async ()=>{
    const data = await getUserData({});
    await connectionColyseus(data.data);

    // draw UI. Here is the logic to spawn cubes.
    setupUi();
    new CustomPainting();
  })

}
