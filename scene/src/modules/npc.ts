import { Entity, GltfContainer, InputAction, MeshCollider, PointerEventType, PointerEvents, Transform, engine, inputSystem } from "@dcl/sdk/ecs";
import { TextBubble } from "./bubble";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { invokeInput } from "./input_ui";
import { globalRoom } from "./global";
import { hasInworldResponse, nextInworldResponse } from "./aiResponse";

export class ReceptionNpc {
    receptionEntity: Entity;
    pointerCollider: Entity;
    bubble: TextBubble;

    constructor(
        transform: any,
    ){
        this.receptionEntity = engine.addEntity();
        Transform.create(
            this.receptionEntity, 
            transform)
        GltfContainer.createOrReplace(this.receptionEntity, {src: "images/woman_idle.glb"})

        this.pointerCollider = engine.addEntity()

        MeshCollider.setBox(this.pointerCollider)
        Transform.create(
            this.pointerCollider, 
            { 
                position: {x: 0, y: 1, z: 0.5},
                scale: {x: 1.4, y: 1.5, z: 1.8},
                parent: this.receptionEntity
        })

        this.bubble = new TextBubble({
            position: Vector3.create(0,2,0),
            scale: Vector3.create(2.5,3,2),
            parent: this.receptionEntity,
            rotation: Quaternion.create(0,0,0)
        });

        PointerEvents.create(
            this.pointerCollider,
            {pointerEvents: [
            {
                eventType: PointerEventType.PET_DOWN,
                eventInfo: {
                    button: InputAction.IA_POINTER,
                    hoverText: `Talk`,
                    maxDistance: 15
                }
            },
        ]})

        engine.addSystem(()=>{
            if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, this.pointerCollider)) {
                if (!this.hasBubble()) {
                    invokeInput(
                        "Reception",
                        "Ask me anything!",
                        (input: string)=>{
                            if (globalRoom) {
                                globalRoom.send("sendInworldMessage",{
                                    text: input,
                                    npcFlag: "receptionist"
                                })
                            }
                    })
                } else {
                    this.nextDialogue();
                }
            }
        });
    }

    bubbleMessage(text: string, duration: number = -1) {
        this.bubble.invokeBubbleText(text);
    }

    hasBubble() {
        return this.bubble.checkVisibility();
    }

    nextDialogue() {
        if (hasInworldResponse()) {
            this.bubbleMessage(nextInworldResponse());
        } else {
            this.bubble.closeTextBubble();
        }
    }
}