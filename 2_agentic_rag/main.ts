import { Content, GoogleGenAI, Part, Type } from "@google/genai";
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generate embedding for a text using Gemini
async function getEmbedding(text: string): Promise<number[]> {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
    });
    return response.embeddings![0].values!;
}

// Search the knowledge base for relevant documents
async function searchKnowledgeBase(query: string, limit = 3): Promise<string[]> {
    const queryEmbedding = await getEmbedding(query);
    const results = await sql`
        SELECT content
        FROM documents
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}
        LIMIT ${limit}
    `;
    return results.map(r => r.content as string);
}

// Function declaration for the model
const searchKnowledgeBaseFn = {
    name: 'search_knowledge_base',
    description: 'Search the knowledge base for relevant information. Use this when you need to find facts or information to answer the user question.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: 'The search query to find relevant documents',
            },
        },
        required: ['query'],
    },
};

// Agentic RAG: Let the model decide when to search
async function agenticRag(userQuestion: string) {
    console.log(`\nUser: ${userQuestion}`);
    console.log('---');

    const contents: Content[] = [
        { role: 'user', parts: [{ text: userQuestion }] }
    ];

    const config = {
        tools: [{ functionDeclarations: [searchKnowledgeBaseFn] }],
    };

    // First call - model decides if it needs to search
    let response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config,
    });

    // Agentic loop: keep processing until no more function calls
    while (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        console.log(`[Agent] Calling: ${functionCall.name}("${functionCall.args?.query}")`);

        // Execute the function
        const searchResults = await searchKnowledgeBase(functionCall.args?.query as string);
        console.log(`[Agent] Found ${searchResults.length} relevant documents`);

        // Add assistant's function call to history
        contents.push({
            role: 'model',
            parts: [{ functionCall: { name: functionCall.name, args: functionCall.args } }] as Part[]
        });

        // Add function result to history
        contents.push({
            role: 'user',
            parts: [{
                functionResponse: {
                    name: functionCall.name,
                    response: { documents: searchResults }
                }
            }] as Part[]
        });

        // Get next response
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config,
        });
    }

    console.log(`\nAssistant: ${response.text}`);
    return response.text;
}

async function main() {
    // Ensure we have documents in the database
    const count = await sql`SELECT COUNT(*) as cnt FROM documents`;
    if (Number(count[0].cnt) === 0) {
        console.log('No documents found. Please run 1_rag/main.ts first to populate the database.');
        return;
    }
    console.log(`Knowledge base has ${count[0].cnt} documents\n`);

    // Test questions - some need RAG, some don't
    const questions = [
        "What is machine learning?",
        "What databases support vector search?",
        "What is 2 + 2?",  // Should not need RAG
    ];

    for (const question of questions) {
        await agenticRag(question);
        console.log('\n' + '='.repeat(60));
    }
}

main().catch(console.error);
