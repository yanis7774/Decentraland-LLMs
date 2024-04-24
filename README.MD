README

Video: https://twitter.com/TonyMo74/status/1740682713332637925

Instructions:

This example scene contains 4 elements:

## NPCs with AI implementation

There are 2 of them, they are created with createNpc() method in index.ts
One of them is non-configured, another is configured. It affects backend system message handling,
configured NPC will use predetermined backend config object to specify system message

CreateNpc() has transform and npc configuration object (like in basic dcl-npc-toolkit)
Then it has ragModel, configuredMode, endpoint, room name and file server url

- ragModel uses rag model generation (which is handled on backend, mostly inside the backend library)
- configureModel specifies backend to use configuration for system message. Won't work with rag model
- endpoint is a url for server connection
- room name is the room name from colyseus server which this project connects to
- file server url is optional, if specified, voice and image files will be fetched from it and not from server url directly

## Banner image generation

Created with new CustomPainting(). Creates a banner painting, clicking it opens up input UI.
Fill in a prompt and click ok to send prompt to backend for further image generation
Connection.ts has a handler to display received image url into the banner painting

## Music boombox generation

created with new MusicBoombox(). Creates a boombox, clicking it opens up input UI.
Fill in a prompt and click ok to send prompt to backend for further music generation
Connection.ts has a handler to turn on received music url once