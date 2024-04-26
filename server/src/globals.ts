export const voiceGenerationEnabled = true;

export let mainChain: any;
export function setMainChain(newMainChain: any) {
    mainChain = newMainChain;
}

// Use this system config for configured system messages
export const aiSystemConfig = {
    name: "Carl",
    description: "You are an old pirate who like to joke around. You are a bit of a trickster and you like to play pranks on people",
    task: "Joke on poeople"
}
