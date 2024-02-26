import {Client, Room} from "colyseus";
import {MainRoomState} from "./schema/MainRoomState";
import {
    exposeImageUrl,
    generateImageWithDALLE,
    saveImageToFile,
} from "../llms/generation/generations";
import { mainChain, voiceGenerationEnabled } from "../globals";
import { getLLMTextAndVoice, modelTypes } from "llm_response_backend";
import { appReadyPromise } from "../app.config";


export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        this.onMessage("getImage", async (client, msg) => {
            const imageResponse = await generateImageWithDALLE(msg.prompt);
            const imagePath = await saveImageToFile(imageResponse);
            const imageUrl = exposeImageUrl(imagePath);
            console.log("imageUrl", imageUrl)

            client.send("setImage", {img: imageUrl})
        })

        this.onMessage("getAnswer", async (client, msg) => {
                let result;
                // @ts-ignore
                
                let text = "";
                let voiceUrl = "";
                // @ts-ignore
                if (msg.rag) {
                    const result = await mainChain.getRagAnswer(msg.text,voiceGenerationEnabled,await appReadyPromise);
                    text = result.response.text;
                    voiceUrl = result.exposedUrl;
                } else {
                    const systemMessage = 'You are NPC that knows everything about Decentraland. You try to be nice with anyone and make friendship';
                    const result = await getLLMTextAndVoice(systemMessage,msg.text,voiceGenerationEnabled,await appReadyPromise);
                    text = result.response;
                    voiceUrl = result.exposedUrl;
                }

                // console.log("ANSWER: ", result.response);
                // console.log("VOICE URL: ", result.exposedUrl);
                client.send("getAnswer", {
                    answer: text,
                    npcFlag: "receptionist",
                    voiceUrl: voiceUrl,
                    voiceEnabled: voiceGenerationEnabled,
                    id: msg.id
                });
            }
        )
    }

    async setUp(room: Room) {
        try {
            console.log("Setting up lobby room...");
        } catch (error) {
            console.error("Error in createImage handler:", error);
        }
    }

    async onJoin(client: Client, options: any) {
        console.log("Joined lobby room successfully...");

    }

    async onLeave(client: Client, consented: boolean) {
        console.log("Leaving lobby room successfully...");


    }

    async onDispose() {
        console.log("Disposed lobby room successfully...");
    }

}