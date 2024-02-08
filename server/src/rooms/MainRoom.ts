import {Client, Room} from "colyseus";
import {MainRoomState} from "./schema/MainRoomState";
import {getAnswer} from "../llms/generation/rag";
import {
    exposeImageUrl,
    generateImageWithDALLE,
    getTextAndVoice,
    saveImageToFile,
} from "../llms/generation/generations";


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
                console.log("msg", msg);
                const systemMessage = 'You are NPC that knows everything about Decentraland. You try to be nice with anyone and make friendship';


                // @ts-ignore
                const {answer, voiceUrl} = await getTextAndVoice(systemMessage, msg.text);

                // const answer = await getOpenAIAnswer(systemMessage, msg.text);
                // console.log('OpenAI Answer:', answer.message.content);
                //
                // const voiceResponse = await generateAndSaveVoiceOver(answer.message.content);


                client.send("getAnswer", {
                    answer: answer.text,
                    npcFlag: "receptionist",
                    voiceUrl: voiceUrl
                });

                client.send("getAnswer", {answer: answer, npcFlag: "receptionist"})

            }
        )
    }

    async setUp(room: Room) {
        try {

            const systemMessage = 'You are NPC that knows everything about Decentraland. You try to be nice with anyone and make friendship';
            const prompt = 'I love you';
            try {
                // const answer = await getTextAndVoice(systemMessage, prompt);
                // // const answer = await getOpenAIAnswer(systemMessage, prompt);
                // console.log('OpenAI Answer:', answer);


                // const voiceResponse = await generateAndSaveVoiceOver(answer.message.content);

            } catch (err) {
                console.error(err);
            }

            console.log("Setting up lobby room...");

            // setTimeout(function () {
            //     // preLoad()
            //
            //     console.log("Timeout is up! This code runs after a delay.");
            // }, 2000); // 2000 milliseconds (2 seconds) delay

            // const answer = await getAnswer("What are the approaches to Task Decomposition? Timeout is up! This code runs after a delay.");
            // console.log("answer", answer.text);
            // console.log("answer", answer);

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




