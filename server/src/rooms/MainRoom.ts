import {Client, Room} from "colyseus";
import {MainRoomState} from "./schema/MainRoomState";
import { aiSystemConfig, mainChain, voiceGenerationEnabled } from "../globals";
import { getLLMTextAndVoice, modelTypes, generateAndSaveImage, generateMusic, getLLMTextAndVoiceConfigured, inpaintImage, generateMusicOS, getOllamaTextAndVoice } from "llm_response";
import { appReadyPromise } from "../app.config";
import { getOllamaText, setOSVoiceGeneration } from "llm_response/dist/generations";
import { atc } from "../utils";


export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        console.log("process.env.SERVER_FILE_URL", process.env.SERVER_FILE_URL)
        console.log("process.env.PORT", process.env.PORT)
        console.log("process.env.OPEN_API_KEY", process.env.OPEN_API_KEY)
        console.log("process.env.REPLICATE_API_TOKEN", process.env.REPLICATE_API_TOKEN)
        console.log("process.env.INPAINT_URL", process.env.INPAINT_URL)
        console.log("process.env.OLLAMA_MODEL", process.env.OLLAMA_MODEL)
        console.log("process.env.OLLAMA_BASE_URL", process.env.OLLAMA_BASE_URL)

        // This listener part is used for generating image for banner and sending it back
        this.onMessage("getImage", async (client, msg) => {
            // may be changed back to old generation
            atc("getImage",async ()=>{
                client.send("startLoading");
                const imageResponse = await generateAndSaveImage(msg.prompt, await appReadyPromise);

                console.log("imageUrl", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`) //

                setTimeout(()=>{
                    client.send("setImage", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`);
                    client.send("stopLoading");
                },1000)
            })
        })

        this.onMessage("getInpaintImage", async (client, msg) => {
            // may be changed back to old generation
            //const imageResponse = await generateAndSaveImage(msg.prompt, await appReadyPromise);
            atc("getInpaintImage",async ()=>{
                client.send("startLoading");
                const imageResponse = await inpaintImage(msg.prompt, await appReadyPromise);
                console.log("imageUrl", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`) //

                setTimeout(()=>{
                    client.send("setInpaintImage", `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${imageResponse}`);
                    client.send("stopLoading");
                },1000)
            })
        })

        // This listener part is used for generating music and sending it back
        this.onMessage("getMusic", async (client, msg) => {
            atc("getMusic",async ()=>{
                client.send("startLoading");
                const result = await generateMusic(msg.prompt);

                setTimeout(()=>{
                    client.send("setMusic", {music: result});
                    client.send("stopLoading");
                },2000)
            });
        })

        // This listener part is used for generating music and sending it back
        this.onMessage("getLocalMusic", async (client, msg) => {
            atc("getLocalMusic",async ()=>{
                client.send("startLoading");
                const result = await generateMusicOS(msg.prompt, await appReadyPromise);

                setTimeout(()=>{
                    client.send("setMusic", {music: `${process.env.SERVER_FILE_URL ? process.env.SERVER_FILE_URL : ""}${result}`});
                    client.send("stopLoading");
                },2000)
            })
        })

        // This listener part is used to handle all NPC's interactions and generate prompts under different conditions
        this.onMessage("getAnswer", async (client, msg) => {

            atc("getAnswer",async ()=>{
                //const systemMessage = 'You are NPC that knows everything about Decentraland. You try to be nice with anyone and make friendship';
                // Responses for queries are generated here
                let text = "";
                let voiceUrl = "";

                if (msg.rag) {
                    // When rag is on, it uses rag system setup in index.ts (openAI for now)
                    setOSVoiceGeneration(false); // Voice generation from openAI is used
                    const result = await mainChain.getRagAnswer(msg.text,voiceGenerationEnabled,await appReadyPromise);
                    text = result.response.text;
                    voiceUrl = result.exposedUrl;
                } else {
                    // when rag is not used, it will then check configured flag
                    let result = undefined;
                    if (!msg.configured) {
                        // Non configured leads to Ollama response generation
                        setOSVoiceGeneration(true); // Local voice generation is used
                        result = await getOllamaTextAndVoice(msg.text, await appReadyPromise);
                    } else {
                        // Configured leads to OpenAI response generation, including config file
                        setOSVoiceGeneration(false); // Voice generation from openAI is used
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
                },5000)
            })
        })
    }

    async setUp(room: Room) {
        try {
            console.log("Setting up lobby room...");
            console.log("process.env.SERVER_FILE_URL", process.env.SERVER_FILE_URL)
            console.log("process.env.PORT", process.env.PORT)
            console.log("process.env.OPEN_API_KEY", process.env.OPEN_API_KEY)
            console.log("process.env.REPLICATE_API_TOKEN", process.env.REPLICATE_API_TOKEN)
            console.log("process.env.INPAINT_URL", process.env.INPAINT_URL)
            console.log("process.env.OLLAMA_MODEL", process.env.OLLAMA_MODEL)
            console.log("process.env.OLLAMA_BASE_URL", process.env.OLLAMA_BASE_URL)
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
