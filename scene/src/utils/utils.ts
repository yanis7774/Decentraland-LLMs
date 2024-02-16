import { AudioSource, AvatarAnchorPointType, AvatarAttach, Entity, engine } from "@dcl/sdk/ecs";
import * as utils from '@dcl-sdk/utils'

export function extractName(input: string): string {
    const regex = /[^#]+/; // Matches everything before the "#" symbol
    const match = input.match(regex);
    if (match) {
        return match[0];
    }
    return input; // Return the original string if "#" is not found
}

export function enablePlayerSound(sound: string){
    let playerSoundEntity: Entity
    playerSoundEntity = engine.addEntity()

    AudioSource.createOrReplace(playerSoundEntity,
        {
            audioClipUrl: sound,
            playing: false,
        })

    AvatarAttach.createOrReplace(playerSoundEntity,{
        anchorPointId: AvatarAnchorPointType.AAPT_POSITION,
    })

    AudioSource.getMutable(playerSoundEntity).volume = 4
    AudioSource.getMutable(playerSoundEntity).playing = true
    utils.timers.setTimeout(() => {
        engine.removeEntity(playerSoundEntity)
    }, 10 * 1000);
}