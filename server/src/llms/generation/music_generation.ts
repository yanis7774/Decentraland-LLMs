import Replicate from 'replicate';
const replicate = new Replicate({auth:"r8_0gohje85XCyBryxl3OFhcixvQKfRexx2OB55V"});


export async function generateMusic() {

    console.log("Generating music...")

    const input = {
        prompt: "Edo25 major g melodies that sound triumphant and cinematic. Leading up to a crescendo that resolves in a 9th harmonic",
        model_version: "large",
        output_format: "mp3",
        normalization_strategy: "peak"
    };

    const output = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", {input});
    console.log(output)
    console.log("Generating music done!")
//=> "https://replicate.delivery/pbxt/OeLYIQiltdzMaCex1shlEFy6...

}
