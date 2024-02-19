import {OpenAI} from "@langchain/openai";
import { exposeVoiceUrl, generateAndSaveVoiceOver } from "./generations";
import { modelTypes } from "../../globals";
import { TextLoader } from "langchain/document_loaders/fs/text";

const {RetrievalQAChain, loadQAStuffChain} = require("langchain/chains");
const {CheerioWebBaseLoader} = require("langchain/document_loaders/web/cheerio");
const {PDFLoader} = require("langchain/document_loaders/fs/pdf");
const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");
const {HNSWLib} = require("@langchain/community/vectorstores/hnswlib");
const {Ollama} = require("@langchain/community/llms/ollama");
const {HuggingFaceTransformersEmbeddings} = require("@langchain/community/embeddings/hf_transformers");
const {PromptTemplate} = require("@langchain/core/prompts");


let chain: any;

export async function preLoad(modelType: modelTypes, baseUrl: string = "http://localhost:11434", modelName: string = "", temperature: number = 0) {

    // Loader for web pages
    // const loader = new CheerioWebBaseLoader(
    //     // "https://lilianweng.github.io/posts/2023-06-23-agent/"
    //     // "https://blog.decentral.games/ice-poker/ice-poker-beginners-guide"
    //     "https://docs.decentral.games/promotions/cashback-program"
    // );


    // Loader for PDFs
    // const loader = new PDFLoader(
    //     "./src/llms/Golfcraft_LLM_information.pdf"
    // )

    // Loader for TXTs
    const loader = new TextLoader("./src/llms/data/mrt.txt");

    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 32,
    });
    const splitDocuments = await splitter.splitDocuments(docs);
    const embedings = new HuggingFaceTransformersEmbeddings()
    const vectorstore = await HNSWLib.fromDocuments(
        splitDocuments,
        embedings
    );
    const retriever = vectorstore.asRetriever();

    let model;

    if (modelType == modelTypes.ollama) {
        // For local LLMs
        model = new Ollama({
            baseUrl: baseUrl,
            model: modelName == "" ? "mistral" : modelName,
            temperature: temperature == 0 ? 0.3 : temperature,
        });
    } else {
        // For OpenAI
        model = new OpenAI({
            openAIApiKey: process.env.OPEN_API_KEY,
            modelName: modelName == "" ? "gpt-3.5-turbo-0613" : modelName,
            temperature: temperature == 0 ? 0.9 : temperature,
            configuration: {
                baseURL: baseUrl,
            },
        });
    }

    const template = `Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        Use three sentences maximum and keep the answer as concise as possible. Be precise with numbers. 
        {context}
        Question: {question}
        Helpful Answer:`;

    const QA_CHAIN_PROMPT = new PromptTemplate({
        inputVariables: ["context", "question"],
        template,
    });

    // Create a retrieval QA chain that uses a Llama 2-powered QA stuff chain with a custom prompt.
    chain = new RetrievalQAChain({
        combineDocumentsChain: loadQAStuffChain(model, {prompt: QA_CHAIN_PROMPT}),
        retriever,
        returnSourceDocuments: true,
        inputKey: "question",
    });

    // return chain;
}


export async function getRagAnswer(question: string, voiceEnabled: boolean = false, voiceModel: string = 'alloy') {
    if (chain) {
        const response = await chain.call({
            question,
        });
        console.log("response: ", response);
        let exposedUrl = "";

        if (voiceEnabled) {
            // Generate and save the voice-over
            const voiceFilePath = await generateAndSaveVoiceOver(response, voiceModel);

            // Expose the URL for the voice file
            exposedUrl = exposeVoiceUrl(voiceFilePath);
        }

        return {response,exposedUrl};
    } else {
        return undefined;
    }
}