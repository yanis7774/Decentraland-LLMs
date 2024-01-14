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

    // const loader = new CheerioWebBaseLoader(
    //     // "https://lilianweng.github.io/posts/2023-06-23-agent/"
    //     // "https://blog.decentral.games/ice-poker/ice-poker-beginners-guide"
    //     "https://docs.decentral.games/promotions/cashback-program"
    // );

    const loader = new PDFLoader(
        "./src/llms/Golfcraft_LLM_information.pdf"
    )


    console.log("loader1", loader)

    const docs = await loader.load();
    // const docs = await loader.load();

    console.log("docs1", docs)

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 32,
    });

    const splitDocuments = await splitter.splitDocuments(docs);

    console.log("splitDocuments", splitDocuments)

    const embedings = new HuggingFaceTransformersEmbeddings()


    const vectorstore = await HNSWLib.fromDocuments(
        splitDocuments,
        embedings

    );

    console.log("vectorstore", vectorstore)


    const retriever = vectorstore.asRetriever();

    console.log("retriever", retriever)


    // const model = new Ollama({
    //     baseUrl: "http://localhost:11434",
    //     model: "mistral",
    //     temperature: 0.3,
    // });


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


/*
  {
    text: 'Thanks for asking! There are several approaches to task decomposition, which can be categorized into three main types:\n' +
      '\n' +
      '1. Using language models with simple prompting (e.g., "Steps for XYZ."), or asking for subgoals for achieving XYZ.\n' +
      '2. Providing task-specific instructions, such as writing a story outline for writing a novel.\n' +
      '3. Incorporating human inputs to decompose tasks.\n' +
      '\n' +
      'Each approach has its advantages and limitations, and the choice of which one to use depends on the specific task and the desired level of complexity and adaptability. Thanks for asking!',
    sourceDocuments: [
      Document {
        pageContent: 'Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.',
        metadata: [Object]
      },
      Document {
        pageContent: 'Fig. 1. Overview of a LLM-powered autonomous agent system.\n' +
          'Component One: Planning#\n' +
          'A complicated task usually involves many steps. An agent needs to know what they are and plan ahead.\n' +
          'Task Decomposition#',
        metadata: [Object]
      },
      Document {
        pageContent: 'Challenges in long-term planning and task decomposition: Planning over a lengthy history and effectively exploring the solution space remain challenging. LLMs struggle to adjust plans when faced with unexpected errors, making them less robust compared to humans who learn from trial and error.',
        metadata: [Object]
      },
      Document {
        pageContent: 'Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure. The search process can be BFS (breadth-first search) or DFS (depth-first search) with each state evaluated by a classifier (via a prompt) or majority vote.',
        metadata: [Object]
      }
    ]
  }
*/
