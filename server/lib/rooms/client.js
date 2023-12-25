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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToRoom = void 0;
// For Node.js, uncomment the following line
const Colyseus = require('colyseus.js');
// Connect to the Colyseus server
const connectToRoom = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = new Colyseus.Client(`ws://localhost:${Number(process.env.PORT)}`);
    console.log("client", client);
    // Join the default room
    client.joinOrCreate("lobby_room").then((room) => {
        console.log("Joined room:", room.id);
        // Listen for messages from the server
        room.onMessage((message) => {
            console.log("Message received from server:", message);
        });
        // Send a message to the server
        room.send({ action: 'say_hello' });
        // Handle room state changes
        room.onStateChange.once((state) => {
            console.log("Initial room state:", state);
        });
        room.onStateChange((state) => {
            console.log("New room state:", state);
        });
    }).catch((e) => {
        console.error("Join room failed:", e);
    });
});
exports.connectToRoom = connectToRoom;
