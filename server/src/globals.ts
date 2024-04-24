export const voiceGenerationEnabled = true;

export let mainChain: any;
export function setMainChain(newMainChain: any) {
    mainChain = newMainChain;
}

// Use this system config for configured system messages
export const aiSystemConfig = {
    name: "",
    description: "",
    task: ""
}