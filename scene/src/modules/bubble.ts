import { AvatarAnchorPointType, AvatarAttach, Entity, Material, MeshRenderer, TextShape, Transform, VisibilityComponent, engine } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";
import * as utils from '@dcl-sdk/utils';

export class TextBubble {

    public tempTimer: any;
    public bubble: Entity;
    public frontTextEntity: Entity;
    public backTextEntity: Entity;

    constructor(
        transform: any | undefined = undefined
    ){
        this.bubble = engine.addEntity()

        MeshRenderer.setPlane(this.bubble)
        Material.setBasicMaterial(this.bubble,{texture: Material.Texture.Common({src:"images/TextBubble.png"})});
        if (transform == undefined) {
            AvatarAttach.create(this.bubble,{
                anchorPointId: AvatarAnchorPointType.AAPT_NAME_TAG,
            })
            Transform.create(this.bubble, {
                scale: Vector3.create(2, 2, 1),
            });
        } else {
            Transform.create(this.bubble,transform);
        }
        VisibilityComponent.create(this.bubble, { visible: false })

        this.frontTextEntity = engine.addEntity();
        Transform.create(this.frontTextEntity,{
            position: Vector3.create(0, 0.3, 0.001),
            rotation: Quaternion.fromEulerDegrees(0, 180.0, 0.0),
            parent: this.bubble,
            scale: Vector3.create(0.7,0.45,0.7)
        })
        TextShape.create(this.frontTextEntity,{
            text: "",
            textWrapping:true,
            textColor:Color4.Black(),
            width:1,
            height:1,
            fontSize:1
        })
        VisibilityComponent.create(this.frontTextEntity, { visible: false })

        this.backTextEntity = engine.addEntity();
        Transform.create(this.backTextEntity,{
            position: Vector3.create(0, 0.3, -0.001),
            parent: this.bubble,
            scale: Vector3.create(0.7,0.45,0.7)
        })
        TextShape.create(this.backTextEntity,{
            text: "",
            textWrapping:true,
            textColor:Color4.Black(),
            width:1,
            height:1,
            fontSize:0.7
        })
        VisibilityComponent.create(this.backTextEntity, { visible: false })
    }

    public closeTextBubble(){
        VisibilityComponent.getMutable(this.bubble).visible = false
        VisibilityComponent.getMutable(this.frontTextEntity).visible = false
        VisibilityComponent.getMutable(this.backTextEntity).visible = false
        TextShape.getMutable(this.frontTextEntity).text = ""
        TextShape.getMutable(this.backTextEntity).text = ""
    }

    public invokeBubbleText(text: string, duration: number = 0){
        TextShape.getMutable(this.frontTextEntity).text = text
        TextShape.getMutable(this.backTextEntity).text = text
        VisibilityComponent.getMutable(this.bubble).visible = true
        VisibilityComponent.getMutable(this.frontTextEntity).visible = true
        VisibilityComponent.getMutable(this.backTextEntity).visible = true

        if (duration > 0) {
            if (this.tempTimer)
            utils.timers.clearTimeout(this.tempTimer);
            this.tempTimer = utils.timers.setTimeout(()=>{ 
                this.closeTextBubble()
            },
            duration * 1000
            );
        }
    }

    public checkVisibility(){
        return VisibilityComponent.getMutable(this.bubble).visible;
    }
}