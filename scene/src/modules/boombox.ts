import { Entity, GltfContainer, InputAction, PointerEventType, PointerEvents, Transform, engine, inputSystem } from "@dcl/ecs";
import { Quaternion, Vector3 } from "@dcl/ecs-math";
import { globalRoom } from "./global";
import { invokeInput } from "./input_ui";

export class MusicBoombox {

    mainEntity: Entity

    constructor() {
        this.mainEntity = engine.addEntity();
        Transform.create(this.mainEntity, {position: Vector3.create(8, 0.4, 13), scale: Vector3.create(1, 1, 1)});
        this.invokePointer();
        GltfContainer.create(this.mainEntity, {src: 'models/boombox.glb'});
    }

    loadAdditionalData(input: string) {
        // enable music?
    }

    sendNewPrompt(input: string) {
        if (globalRoom != undefined) {
            console.log("SENDING MUSIC PROMPT", input)
            globalRoom.send("getMusic", {
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
