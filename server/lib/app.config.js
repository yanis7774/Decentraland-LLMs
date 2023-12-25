"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("@colyseus/tools"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const MainRoom_1 = require("./rooms/MainRoom");
const ws_transport_1 = require("@colyseus/ws-transport");
const colyseus_1 = require("colyseus");
const client_1 = require("./rooms/client");
exports.default = (0, tools_1.default)({
    getId: () => "Your Colyseus App",
    options: {
        presence: new colyseus_1.LocalPresence()
    },
    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer
            .define('lobby_room', MainRoom_1.MainRoom)
            .filterBy(['realm'])
            .enableRealtimeListing();
    },
    initializeTransport: (options) => {
        return new ws_transport_1.WebSocketTransport(Object.assign(Object.assign({}, options), { pingInterval: 3000, pingMaxRetries: 6 }));
    },
    initializeExpress: (app) => {
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
        const allowlist = ['https://play.decentraland.org', 'https://play.decentraland.zone'];
        const corsOptionsDelegate = (req, callback) => {
            try {
                let corsOptions;
                if (allowlist.indexOf(req.header('Origin')) !== -1) {
                    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
                }
                else {
                    corsOptions = { origin: false }; // disable CORS for this request
                }
                callback(null, corsOptions); // callback expects two parameters: error and options
            }
            catch (e) {
                console.log("Error in cors option delegate", e);
            }
        };
        app.use((0, cors_1.default)(corsOptionsDelegate));
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
    },
    beforeListen: () => {
        (0, client_1.connectToRoom)();
    }
});
