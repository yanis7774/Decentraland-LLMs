import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";
import { modelTypes, preLoad } from "llm_response_backend";

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig, Number(process.env.PORT) || 3029);
preLoad(modelTypes.openAI,{src:"./src/llms/data/mrt.txt",type:'txt'});

// connectToRoom().then(r => console.log("connected to room"));
