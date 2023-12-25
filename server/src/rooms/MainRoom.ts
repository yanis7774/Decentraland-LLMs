import {Client, Room} from "colyseus";
import {MainRoomState} from "./schema/MainRoomState";
import axios from "axios";
import fs from "fs";
import path from "path";
import OpenAI  from 'openai';

export class MainRoom extends Room<MainRoomState> {
    onCreate(options: any) {
        this.setState(new MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;

        this.onMessage("addEvent", async (client: Client, message) => {

        });
    }

    async setUp(room: Room) {
        try {
            const prompt: string = "A painting of a glass of water on a table. The painting is very realistic.";

            // Generate image using DALL-E
            const imageResponse = await generateImageWithDALLE(prompt);
            console.log("imageResponse", imageResponse)

            // Save the image to a folder
            const imagePath = saveImageToFileSystem(imageResponse.data);
            console.log("imagePath", imagePath)

            // Expose the image URL
            const imageUrl = exposeImageUrl(await imagePath);
            console.log("imageUrl", imageUrl)

            // Send the image URL to the client
            // client.send("imageCreated", { imageUrl });
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
        size: "1024x1024"
    }, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPEN_API_KEY}`
        }
    });

    // Extracting URL of the generated image
    const imageUrl = response.data.data[0].url;
    return imageUrl;
}


async function saveImageToFileSystem(imageUrl: string) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        const imagePath = path.join(__dirname, "images", "generatedImage.png");
        fs.writeFileSync(imagePath, response.data, "binary");
        return imagePath;
    } catch (error) {
        console.error("Error in downloading image:", error);
        throw error;
    }
}
// Expose the image URL
function exposeImageUrl(imagePath: string) {
    const relativePath = path.relative(__dirname, imagePath);
    const imageUrl = `http://yourserver.com/${relativePath}`;
    return imageUrl;
}

