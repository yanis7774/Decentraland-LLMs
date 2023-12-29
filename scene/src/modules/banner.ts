import {
    Entity,
    GltfContainer,
    InputAction,
    Material,
    MeshCollider,
    MeshRenderer,
    PointerEventType,
    PointerEvents,
    Transform,
    engine,
    inputSystem
} from "@dcl/sdk/ecs";
import {Quaternion, Vector3} from "@dcl/sdk/math";
import {globalRoom} from "./global";
import {invokeInput} from "./input_ui";

export let banner: CustomPainting;

export class CustomPainting {

    picture: Entity;
    mainEntity: Entity

    constructor() {
        banner = this;
        this.mainEntity = engine.addEntity();
        Transform.create(this.mainEntity, {position: Vector3.create(8, 5, 6), scale: Vector3.create(10, 10, 0.1)});
        MeshRenderer.setBox(this.mainEntity);
        MeshCollider.setBox(this.mainEntity);
        this.picture = engine.addEntity();
        MeshRenderer.setPlane(this.picture);
        const params = {
            pos: Vector3.create(0, 0, 0.7),
            rot: Quaternion.create(0.0, 0.0, 0.0),
            scale: Vector3.create(-1, 1, 1)
        };
        Transform.create(this.picture, {
            parent: this.mainEntity,
            position: params.pos,
            rotation: params.rot,
            scale: params.scale
        });
        this.invokePointer();
    }

    loadAdditionalData(input: string) {
        Material.setPbrMaterial(this.picture, {texture: Material.Texture.Common({src: input})});
    }

    sendNewPrompt(input: string) {
        if (globalRoom != undefined)
            console.log("SENDING PROMPT", input)
        globalRoom.send("getImage", {
            prompt: input
        })
    }


    invokePointer() {
        PointerEvents.create(this.mainEntity, {
            pointerEvents: [
                {
                    eventType: PointerEventType.PET_DOWN,
                    eventInfo: {
                        button: InputAction.IA_POINTER,
                        hoverText: "Insert Prompt",
                        maxDistance: 50
                    }
                },
            ]
        })
        let pointerSystem = () => {
            if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, this.mainEntity)) {
                invokeInput("INPUT", "INPUT PROMPT",
                    (input: string) => {
                        this.sendNewPrompt(input);
                    }
                )
            }
        }
        engine.addSystem(pointerSystem);
    }
}
