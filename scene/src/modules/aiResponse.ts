let response_array: string[] = []

export async function addLocalLLMResponse(text: string) {
    response_array.push(text);
}

export function haslocalLLMResponse() {
    return response_array.length > 0
}

export function nextLocalLLMResponse() {
    console.log("response_array", response_array);
    let response = "";
    if (response_array.length) {
        let nextText = response_array[0];
        response_array.splice(0,1);
        response = nextText;
    }
    return response;
}
