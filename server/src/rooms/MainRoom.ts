import {Client, Room} from "colyseus";
import {MainRoomState} from "./schema/MainRoomState";
import { aiSystemConfig, mainChain, voiceGenerationEnabled } from "../globals";
import { getLLMTextAndVoice, modelTypes, generateAndSaveImage, generateMusic, getLLMTextAndVoiceConfigured, inpaintImage, generateMusicOS, getOllamaTextAndVoice } from "llm_response";
import { appReadyPromise } from "../app.config";
import { getOllamaText, setOSVoiceGeneration } from "llm_response/dist/generations";


export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        // This listener part is used for generating image for banner and sending it back
        this.onMessage("getImage", async (client, msg) => {
            // may be changed back to old generation

            client.send("startLoading");
            const imageResponse = await generateAndSaveImage(msg.prompt, await appReadyPromise);

            console.log("imageUrl", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`) // 

            setTimeout(()=>{
                client.send("setImage", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`);
                client.send("stopLoading");
            },1000)
        })

        this.onMessage("getInpaintImage", async (client, msg) => {
            // may be changed back to old generation
            //const imageResponse = await generateAndSaveImage(msg.prompt, await appReadyPromise);
            client.send("startLoading");
            const imageResponse = await inpaintImage(msg.prompt, await appReadyPromise);
            console.log("imageUrl", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`) // 

            setTimeout(()=>{
                client.send("setInpaintImage", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`);
                client.send("stopLoading");
            },1000)
        })

        // This listener part is used for generating music and sending it back
        this.onMessage("getMusic", async (client, msg) => {
            //const result = await generateMusic(msg.prompt);
            client.send("startLoading");
            const result = await generateMusic(msg.prompt);

            setTimeout(()=>{
                client.send("setMusic", {music: result});
                client.send("stopLoading");
            },2000)
            
        })

        // This listener part is used for generating music and sending it back
        this.onMessage("getLocalMusic", async (client, msg) => {
            //const result = await generateMusic(msg.prompt);
            client.send("startLoading");
            const result = await generateMusicOS(msg.prompt, await appReadyPromise);

            setTimeout(()=>{
                client.send("setMusic", {music: `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${result}`});
                client.send("stopLoading");
            },2000)
            
        })

        // This listener part is used to handle all NPC's interactions and generate prompts under different conditions
        this.onMessage("getAnswer", async (client, msg) => {
            console.log("WHERE???");
            this.broadcast("startLoading");
            let result;
            // @ts-ignore

            let text = "";
            let voiceUrl = "";
            // @ts-ignore
            if (msg.rag) {
                setOSVoiceGeneration(false);
                const result = await mainChain.getRagAnswer(msg.text,voiceGenerationEnabled,await appReadyPromise);
                text = result.response.text;
                voiceUrl = result.exposedUrl;
            } else {
                let result = undefined;
                if (!msg.configured) {
                    //const systemMessage = 'You are NPC that knows everything about Decentraland. You try to be nice with anyone and make friendship';
                    //result = await getLLMTextAndVoice(systemMessage,msg.text,await appReadyPromise);
                    setOSVoiceGeneration(true);
                    result = await getOllamaTextAndVoice(text,await appReadyPromise);
                } else {
                    setOSVoiceGeneration(false);
                    result = await getLLMTextAndVoiceConfigured(aiSystemConfig,msg.text,await appReadyPromise);
                }
                text = result.response;
                voiceUrl = result.exposedUrl;
                console.log("VOICE URL: ", voiceUrl);
            }

            setTimeout(()=>{
                client.send("getAnswer", {
                    answer: text,
                    voiceUrl: voiceUrl,
                    voiceEnabled: voiceGenerationEnabled,
                    id: msg.id
                });
                this.broadcast("stopLoading");
            },5000)
        })
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
