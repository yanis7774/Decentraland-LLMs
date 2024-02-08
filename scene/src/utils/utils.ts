export function extractName(input: string): string {
    const regex = /[^#]+/; // Matches everything before the "#" symbol
    const match = input.match(regex);
    if (match) {
        return match[0];
    }
    return input; // Return the original string if "#" is not found
}


