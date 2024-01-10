let response_array: string[] = []

export function addInworldResponse(text: string) {
    response_array.push(text);
}

export function hasInworldResponse() {
    return response_array.length > 0
}

export function nextInworldResponse() {
    let response = "";
    if (response_array.length) {
        let nextText = response_array[0];
        response_array.splice(0,1);
        response = nextText;
    }
    return response;
}