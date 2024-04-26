export let globalRoom: any;

export function setRoom(room: any) {
    globalRoom = room;
}

export let receptionist: any;
export function setReceptionist(newreceptionist: any) {
    receptionist = newreceptionist;
}

export let configuredNpc: any;
export function setConfiguredNpc(newnpc: any) {
    receptionist = newnpc;
}

export const productionFileUrl = "https://sdk7.mrt.games";
export const previewFileUrl = "http://localhost:2574";
export const productionUrl = "https://sdk7.mrt.games/serverAI";
export const previewUrl = "http://localhost:2574";
