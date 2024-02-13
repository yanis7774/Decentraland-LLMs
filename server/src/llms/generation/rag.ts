import {OpenAI} from "@langchain/openai";

const {RetrievalQAChain, loadQAStuffChain} = require("langchain/chains");
const {CheerioWebBaseLoader} = require("langchain/document_loaders/web/cheerio");
const {PDFLoader} = require("langchain/document_loaders/fs/pdf");
const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");
const {HNSWLib} = require("@langchain/community/vectorstores/hnswlib");
const {Ollama} = require("@langchain/community/llms/ollama");
const {HuggingFaceTransformersEmbeddings} = require("@langchain/community/embeddings/hf_transformers");
const {PromptTemplate} = require("@langchain/core/prompts");


let chain: any;


export async function preLoad() {

    // Loader for web pages
    // const loader = new CheerioWebBaseLoader(
    //     // "https://lilianweng.github.io/posts/2023-06-23-agent/"
    //     // "https://blog.decentral.games/ice-poker/ice-poker-beginners-guide"
    //     "https://docs.decentral.games/promotions/cashback-program"
    // );


    // Loader for PDFs
    const loader = new PDFLoader(
        "./src/llms/Golfcraft_LLM_information.pdf"
    )

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

    // For local LLMs
    // const model = new Ollama({
    //     baseUrl: "http://localhost:11434",
    //     model: "mistral",
    //     temperature: 0.3,
    // });


    // For OpenAI
    const model = new OpenAI({
        openAIApiKey: process.env.OPEN_API_KEY,
        modelName: "gpt-3.5-turbo-0613"
        // temperature: 0.9,
        // configuration: {
        //     baseURL: "http://localhost:11434",
        // },
    });

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


    // console.log("chain", chain)

    // return chain;

}


export async function getAnswer(question: string) {
    const response = await chain.call({
        question,
    });
    return response;
}

// const response_llm = await chain.call({
//     question: "What are the approaches to Task Decomposition?",
// });
