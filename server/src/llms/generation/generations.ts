import fs from "fs";
import path from "path";
import { appReadyPromise } from "../../app.config";
import OpenAI from "openai";
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

export async function generateImageWithDALLE(prompt: string) {
    try {
        const response = await openai.images.generate({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });
        const imageUrl = response.data[0].url;
        return imageUrl;
    } catch (error) {
        console.error(`Error in generateImageWithDALLE: ${error}`);
        throw new Error(`Error generating image: ${error}`);
    }
}

export async function saveImageToFile(base64Data: WithImplicitCoercion<string> | {
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
        fs.writeFileSync(fullPath, buffer, 'binary');

        console.log(`Image saved successfully at ${fullPath}`);

        return fullPath;

    } catch (error) {
        console.error('Error saving the image:', error);
    }
}

export function exposeImageUrl(imagePath: string) {
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

