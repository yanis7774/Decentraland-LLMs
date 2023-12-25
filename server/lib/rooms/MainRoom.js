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
class MainRoom extends colyseus_1.Room {
    onCreate(options) {
        this.setState(new MainRoomState_1.MainRoomState());
        this.setUp(this);
        this.setSeatReservationTime(60);
        this.maxClients = 100;
        this.onMessage("getImage", (client, msg) => __awaiter(this, void 0, void 0, function* () {
            // Add prompt generation here
            // msg.prompt <== PROMPT
            client.send("setImage", { img: "https://lh3.googleusercontent.com/ci/ALr3YSFwr-NKbqeH7zfQAiaqxY3nWD9pIwv8L8j4Ywr2s_fW9mtFYnRINIw8fd7J2UVCoG2XR3K_ckAE=s1200" });
        }));
    }
    setUp(room) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = "A painting of a glass of water on a table. The painting is very realistic.";
                // Generate image using DALL-E
                //const imageResponse = await generateImageWithDALLE(prompt);
                //console.log("imageResponse", imageResponse)
                // Save the image to a folder
                //const imagePath = saveImageToFileSystem(imageResponse.data);
                //console.log("imagePath", imagePath)
                // Expose the image URL
                //const imageUrl = exposeImageUrl(await imagePath);
                //console.log("imageUrl", imageUrl)
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
    });
}
function saveImageToFileSystem(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer'
            });
            const imagePath = path_1.default.join(__dirname, "images", "generatedImage.png");
            fs_1.default.writeFileSync(imagePath, response.data, "binary");
            return imagePath;
        }
        catch (error) {
            console.error("Error in downloading image:", error);
            throw error;
        }
    });
}
// Expose the image URL
function exposeImageUrl(imagePath) {
    const relativePath = path_1.default.relative(__dirname, imagePath);
    const imageUrl = `http://yourserver.com/${relativePath}`;
    return imageUrl;
}
