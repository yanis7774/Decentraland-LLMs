import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";
import { preLoad } from "./llms/generation/rag";
import { modelTypes } from "./globals";

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig, Number(process.env.PORT) || 3029);
preLoad(modelTypes.openAI);

// connectToRoom().then(r => console.log("connected to room"));
