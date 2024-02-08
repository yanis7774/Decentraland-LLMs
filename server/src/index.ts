import { listen } from "@colyseus/tools";

// Import app config
import appConfig from "./app.config";

// Create and listen on 2567 (or PORT environment variable.)
listen(appConfig, Number(process.env.PORT) || 3029);


// connectToRoom().then(r => console.log("connected to room"));
