import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";
import { createRagChain, modelTypes, setupOpenAIKey, setupReplicateKey } from "llm_response";
import { setMainChain } from "./globals";

// Create and listen on 2567 (or PORT environment variable.)
setupOpenAIKey(process.env.OPEN_API_KEY);
setupReplicateKey(process.env.REPLICATE_API_TOKEN);
listen(appConfig, Number(process.env.PORT) || 3029);
setTimeout(async ()=>{
    setMainChain(await createRagChain(modelTypes.openAI,{src:"./src/llms/data/mrt.txt",type:'txt'}));
},10);