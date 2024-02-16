import fs from "fs";
import path from "path";
import { appReadyPromise } from "../../app.config";
import OpenAI from "openai";
import { Audio } from "openai/resources";
import SpeechCreateParams = Audio.SpeechCreateParams;
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

export async function getTextAndVoice(systemMessage: string, prompt: string, voiceModel = 'alloy') {
    try {
        // Get the response from OpenAI
        const openAIResponse = await getOpenAIAnswer(systemMessage, prompt);

        // Generate and save the voice-over
        const voiceFilePath = await generateAndSaveVoiceOver(openAIResponse, voiceModel);

        // Expose the URL for the voice file
        const exposedUrl = exposeVoiceUrl(voiceFilePath);

        return { openAIResponse, exposedUrl };
    } catch (error) {
        console.error(`Error in getTextAndVoice: ${error}`);
        throw error;
    }
}

export async function getOpenAIAnswer(systemMessage: string, prompt: string) {
    try {
        const completion = await openai.chat.completions.create({
            messages: [{ "role": "system", "content": systemMessage }, { "role": "user", "content": prompt }],
            model: "gpt-3.5-turbo",
        });

        const answer = completion.choices[0].message.content
        console.log(`OpenAI response: ${answer}`)

        return answer
    } catch (error) {
        console.error(`Error in getOpenAIAnswer: ${error}`);
        throw new Error(`Error fetching answer from OpenAI API: ${error}`);
    }
}

export async function generateAndSaveVoiceOver(text: string, voiceModel = 'alloy') {
    try {
        const mp3 = await openai.audio.speech.create(<SpeechCreateParams>{
            model: "tts-1",
            voice: voiceModel,
            input: text,
        });

        console.log(`mp3 ${mp3}`);


        const folderPath = './voices';
        const timestamp = new Date().getTime();
        const filename = `voice_${timestamp}.mp3`;

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        const fullPath = path.join(folderPath, filename);
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await fs.promises.writeFile(fullPath, buffer);

        console.log(`Voice file saved successfully at ${fullPath}`);
        return fullPath;
    } catch (error) {
        console.error(`Error in generateAndSaveVoiceOver: ${error}`);
        throw new Error(`Error generating and saving voice over: ${error}`);
    }
}

export function exposeVoiceUrl(voicePath: string) {
    const urlPath = `/voices/${path.basename(voicePath)}`;

    appReadyPromise.then((app) => {
        // @ts-ignore
        app.get(urlPath, (req: any, res: { sendFile: (arg0: string, arg1: (err: any) => void) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
            const absolutePath = path.resolve(voicePath);
            console.log(`Serving voice file: ${absolutePath}`);
            res.sendFile(absolutePath, (err) => {
                if (err) {
                    console.error(`Error serving ${absolutePath}:`, err);
                    res.status(500).send("Error serving voice file");
                }
            });
        });

        console.log(`Route for voice file ${urlPath} is ready`);
    });

    return `${urlPath}`;
}

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

