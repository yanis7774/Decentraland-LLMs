import {Client, Room} from "colyseus";
import {MainRoomState} from "./schema/MainRoomState";
import axios from "axios";
import fs from "fs";
import path from "path";
import {appReadyPromise} from "../app.config";
import {InworldClient, InworldPacket} from "@inworld/nodejs-sdk";
import {getAnswer, preLoad} from "../llms/rag";


export class MainRoom extends Room<MainRoomState> {
    public inworldClient: any = undefined;
    public inworldConnection: any = undefined;

    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        this.onMessage("getImage", async (client, msg) => {
            // Add prompt generation here
            console.log("msg", msg)

            const imageResponse = await generateImageWithDALLE(msg.prompt);
            // console.log("imageResponse", imageResponse)

            // Save the image to a folder
            // const imagePath = saveImageToFileSystem(imageResponse);
            // console.log("imagePath", imagePath)

            const imagePath = await saveImageToFile(imageResponse);
            console.log("imagePath", imagePath)
            //
            // Expose the image URL
            // @ts-ignore
            const imageUrl = exposeImageUrl(imagePath);
            console.log("imageUrl", imageUrl)

            // msg.prompt <== PROMPT
            // client.send("setImage", {img: "https://lh3.googleusercontent.com/ci/ALr3YSFwr-NKbqeH7zfQAiaqxY3nWD9pIwv8L8j4Ywr2s_fW9mtFYnRINIw8fd7J2UVCoG2XR3K_ckAE=s1200"})
            client.send("setImage", {img: imageUrl})
        })

        this.onMessage("getAnswer", async (client, msg) => {

                console.log("msg", msg)
                const answer = await getAnswer(msg.text);

                console.log("answer", answer.text);


                // client.send("getAnswer", {answer: answer.text})
                client.send("getAnswer", {answer: answer.text, npcFlag:"receptionist"})


            }
        )
    }

    async setUp(room: Room) {
        try {
            console.log("Setting up lobby room...");


            // Using setTimeout to set a timeout
            setTimeout(function () {
                preLoad()
                // Your code to be executed after the timeout
                console.log("Timeout is up! This code runs after a delay.");
            }, 2000); // 2000 milliseconds (2 seconds) delay





            // const answer = await getAnswer("What are the approaches to Task Decomposition?");
            // const answer = await getAnswer("How can I start to play?");
            // const answer = await getAnswer("Do I need a real money to play?");
            //
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

// Generate an image with DALL-E
async function generateImageWithDALLE(prompt: string) {
    const response = await axios.post("https://api.openai.com/v1/images/generations", {
        model: "dall-e-3", // or "dall-e-2"
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
    }, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPEN_API_KEY}`
        }
    });

    // console.log("response", response)
    // console.log("response", response.data.data[0])
    // Extracting URL of the generated image
    const imageUrl = response.data.data[0].b64_json;
    return imageUrl;

}

async function saveImageToFile(base64Data: WithImplicitCoercion<string> | {
    [Symbol.toPrimitive](hint: "string"): string;
}) {
    const folderPath = './images';
    const timestamp = new Date().getTime();
    const filename = `image_${timestamp}.png`;

    try {
        // Decode base64 string to a buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Ensure the folder exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        // Define the full path for the image
        const fullPath = path.join(folderPath, filename);

        // Save the buffer as an image file
        fs.writeFileSync(fullPath, buffer);

        console.log(`Image saved successfully at ${fullPath}`);

        return fullPath;

    } catch (error) {
        console.error('Error saving the image:', error);
    }
}

// Expose the image URL
function exposeImageUrl(imagePath: string) {
    const absolutePath = path.resolve(__dirname, '..', '..', imagePath);

    appReadyPromise.then((app) => {
        // @ts-ignore
        app.get(`/${imagePath}`, (req, res) => {
            console.log(`Serving image: ${imagePath}`);
            res.sendFile(absolutePath, (err: any) => {
                if (err) {
                    console.error(`Error serving ${imagePath}:`, err);
                    res.status(500).send("Error serving image");
                }
            });
        });

        console.log(`Route for image ${imagePath} is ready`);
    });

    return `http://localhost:2574/${imagePath}`
}

