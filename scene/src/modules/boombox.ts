import { Entity, GltfContainer, InputAction, PointerEventType, PointerEvents, Transform, engine, inputSystem } from "@dcl/ecs";
import { Quaternion, Vector3 } from "@dcl/ecs-math";
import { globalRoom } from "./global";
import { invokeInput } from "./ui/input_ui";
import { createText } from "./titleText";

export class MusicBoombox {

    mainEntity: Entity
    local: boolean

    constructor(local: boolean, position: Vector3) {
        this.local = local;
        this.mainEntity = engine.addEntity();
        Transform.create(this.mainEntity, {position: position, scale: Vector3.create(1, 1, 1)});
        this.invokePointer();
        GltfContainer.create(this.mainEntity, {src: 'models/boombox.glb'});

        let textParams = {
            position: {...position},
            scale: Vector3.create(1, 1, 1)
        }
        textParams.position.y += 2;
        createText(textParams,local ? "Local Music Generation" : "Replicate Music Generation")
    }

    sendNewPrompt(input: string) {
        if (globalRoom != undefined) {
            console.log("SENDING MUSIC PROMPT", input)
            globalRoom.send(this.local ? "getLocalMusic" : "getMusic", {
                prompt: input
            })
        }
    }

    invokePointer() {
        PointerEvents.create(this.mainEntity, {
            pointerEvents: [
                {
                    eventType: PointerEventType.PET_DOWN,
                    eventInfo: {
                        button: InputAction.IA_POINTER,
                        hoverText: "Insert Music Prompt",
                        maxDistance: 50
                    }
                },
            ]
        })
        let pointerSystem = () => {
            if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, this.mainEntity)) {
                invokeInput("INPUT", "INPUT MUSIC PROMPT",
                    (input: string) => {
                        this.sendNewPrompt(input);
                    }
                )
            }
        }
        engine.addSystem(pointerSystem);
    }
}
