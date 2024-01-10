"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainRoom = void 0;
const colyseus_1 = require("colyseus");
const MainRoomState_1 = require("./schema/MainRoomState");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app_config_1 = require("../app.config");
const nodejs_sdk_1 = require("@inworld/nodejs-sdk");
class MainRoom extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new MainRoomState_1.MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;
        this.onMessage("sendInworldMessage", (client, message) => __awaiter(this, void 0, void 0, function* () {
            const user = this.state.users.get(client.sessionId);
            console.log("SEND INWORLD");
            if (user.inworldClient != undefined) {
                user.inworldConnection.sendText(message.text);
            }
            else {
                const inClient = new nodejs_sdk_1.InworldClient()
                    .setApiKey({
                    key: process.env.INWORLD_KEY,
                    secret: process.env.INWORLD_SECRET,
                })
                    .setUser({ fullName: user.name })
                    .setConfiguration({
                    capabilities: { audio: false, emotions: false },
                })
                    .setScene(process.env.INWORLD_SCENE)
                    .setOnError((err) => { })
                    .setOnMessage((packet) => {
                    //console.log(`PACKET: ${packet}`);
                    if (packet.text != undefined)
                        client.send("inworldResponse", {
                            text: packet.text.text,
                            npcFlag: message.npcFlag
                        });
                    if (packet.isInteractionEnd()) {
                        inworldConnection.close();
                    }
                });
                const inworldConnection = inClient.build();
                user.inworldClient = inClient;
                user.inworldConnection = inworldConnection;
                yield inworldConnection.sendText(message.text);
            }
        }));
        this.onMessage("getImage", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            // Add prompt generation here
            console.log("msg", msg);
            const imageResponse = yield generateImageWithDALLE(msg.prompt);
            // console.log("imageResponse", imageResponse)
            // Save the image to a folder
            // const imagePath = saveImageToFileSystem(imageResponse);
            // console.log("imagePath", imagePath)
            const imagePath = yield saveImageToFile(imageResponse);
            console.log("imagePath", imagePath);
            //
            // Expose the image URL
            // @ts-ignore
            const imageUrl = exposeImageUrl(imagePath);
            console.log("imageUrl", imageUrl);
            // msg.prompt <== PROMPT
            // client.send("setImage", {img: "https://lh3.googleusercontent.com/ci/ALr3YSFwr-NKbqeH7zfQAiaqxY3nWD9pIwv8L8j4Ywr2s_fW9mtFYnRINIw8fd7J2UVCoG2XR3K_ckAE=s1200"})
            client.send("setImage", { img: imageUrl });
        }));
    }
    setUp(room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                app_config_1.appReadyPromise.then((app) => {
                    // Now you can use `app` here
                    // @ts-ignore
                    app.get(`/test`, (req, res) => {
                        console.log('This is a new route /test');
                    });
                });
                // const prompt: string = "A painting of a glass of water on a table. The painting is very realistic.";
                // console.log("prompt", prompt)
                // Generate image using DALL-E
                // const imageResponse = await generateImageWithDALLE(prompt);
                // // console.log("imageResponse", imageResponse)
                //
                // // Save the image to a folder
                // // const imagePath = saveImageToFileSystem(imageResponse);
                // // console.log("imagePath", imagePath)
                //
                // const imagePath = await saveImageToFile(imageResponse);
                // console.log("imagePath", imagePath)
                // //
                // // Expose the image URL
                // // @ts-ignore
                // const imageUrl = exposeImageUrl(imagePath);
                // console.log("imageUrl", imageUrl)
                // Send the image URL to the client
                // client.send("imageCreated", { imageUrl });
            }
            catch (error) {
                console.error("Error in createImage handler:", error);
            }
        });
    }
    onJoin(client, options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Joined lobby room successfully...");
        });
    }
    onLeave(client, consented) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Leaving lobby room successfully...");
        });
    }
    onDispose() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Disposed lobby room successfully...");
        });
    }
}
exports.MainRoom = MainRoom;
// Generate an image with DALL-E
function generateImageWithDALLE(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post("https://api.openai.com/v1/images/generations", {
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
    });
}
function saveImageToFile(base64Data) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = './images';
        const timestamp = new Date().getTime();
        const filename = `image_${timestamp}.png`;
        try {
            // Decode base64 string to a buffer
            const buffer = Buffer.from(base64Data, 'base64');
            // Ensure the folder exists
            if (!fs_1.default.existsSync(folderPath)) {
                fs_1.default.mkdirSync(folderPath);
            }
            // Define the full path for the image
            const fullPath = path_1.default.join(folderPath, filename);
            // Save the buffer as an image file
            fs_1.default.writeFileSync(fullPath, buffer);
            console.log(`Image saved successfully at ${fullPath}`);
            return fullPath;
        }
        catch (error) {
            console.error('Error saving the image:', error);
        }
    });
}
// Expose the image URL
function exposeImageUrl(imagePath) {
    const absolutePath = path_1.default.resolve(__dirname, '..', '..', imagePath);
    app_config_1.appReadyPromise.then((app) => {
        // @ts-ignore
        app.get(`/${imagePath}`, (req, res) => {
            console.log(`Serving image: ${imagePath}`);
            res.sendFile(absolutePath, (err) => {
                if (err) {
                    console.error(`Error serving ${imagePath}:`, err);
                    res.status(500).send("Error serving image");
                }
            });
        });
        console.log(`Route for image ${imagePath} is ready`);
    });
    return `http://localhost:2574/${imagePath}`;
}
