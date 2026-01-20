import 'dotenv/config';
import * as readline from 'readline';
import { Content, GoogleGenAI, Part, Type } from "@google/genai";
import { neon } from '@neondatabase/serverless';
import { resumeSections, ResumeSection } from './resume';

const sql = neon(process.env.DATABASE_URL!);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System prompt that focuses the model on Alpha's resume only
const SYSTEM_PROMPT = `You are Alpha's professional resume assistant. Your ONLY purpose is to answer questions about Alpha's professional background, skills, experience, education, and career.

STRICT RULES:
1. ONLY answer questions related to Alpha's resume, career, skills, experience, education, projects, or professional background.
2. If a question is NOT about Alpha's resume or professional background, politely decline and redirect. Say: "I'm Alpha's resume assistant and can only answer questions about Alpha's professional background. Feel free to ask about Alpha's skills, experience, education, or projects!"
3. ALWAYS use the search_resume function to find relevant information before answering questions about Alpha.
4. Base your answers ONLY on the information retrieved from the resume database. Do not make up or assume information not present in the search results.
5. Be professional, concise, and helpful when discussing Alpha's qualifications.
6. If the search results don't contain enough information to answer, say so honestly.

Examples of questions you SHOULD answer:
- "What programming languages does Alpha know?"
- "Where did Alpha work before?"
- "What is Alpha's education background?"
- "Tell me about Alpha's projects"
- "Is Alpha available for new roles?"

Examples of questions you should DECLINE:
- "What's the weather today?"
- "Write me a poem"
- "Help me with my homework"
- "What's the capital of France?"
- Any question not about Alpha's professional background`;

// Generate embedding for text
async function getEmbedding(text: string): Promise<number[]> {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
    });
    return response.embeddings![0].values!;
}

// Initialize database with resume table
async function initDb() {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    await sql`
        CREATE TABLE IF NOT EXISTS resume_sections (
            id SERIAL PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding vector(3072)
        )
    `;
    console.log('Database initialized');
}

// Check if resume is already loaded
async function isResumeLoaded(): Promise<boolean> {
    const result = await sql`SELECT COUNT(*) as cnt FROM resume_sections`;
    return Number(result[0].cnt) > 0;
}

// Load resume sections into database with embeddings
async function loadResume() {
    console.log('Loading Alpha\'s resume into vector database...\n');

    for (const section of resumeSections) {
        // Create rich text for embedding that includes context
        const textToEmbed = `${section.category}: ${section.title}. ${section.content}`;
        const embedding = await getEmbedding(textToEmbed);

        await sql`
            INSERT INTO resume_sections (category, title, content, embedding)
            VALUES (${section.category}, ${section.title}, ${section.content}, ${JSON.stringify(embedding)})
        `;
        console.log(`  Embedded: ${section.title}`);
    }

    console.log(`\nLoaded ${resumeSections.length} resume sections`);
}

// Search resume sections by semantic similarity
async function searchResume(query: string, limit = 4): Promise<ResumeSection[]> {
    const queryEmbedding = await getEmbedding(query);
    const results = await sql`
        SELECT category, title, content
        FROM resume_sections
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}
        LIMIT ${limit}
    `;
    return results as ResumeSection[];
}

// Function declaration for Gemini
const searchResumeFn = {
    name: 'search_resume',
    description: 'Search Alpha\'s resume for relevant information. Use this to find details about Alpha\'s skills, experience, education, projects, contact info, or any other professional information.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: 'The search query to find relevant resume sections. Be specific about what information you need (e.g., "programming languages", "work experience at TechCorp", "education background").',
            },
        },
        required: ['query'],
    },
};

// Process user question with agentic RAG
async function askAboutResume(userQuestion: string): Promise<string> {
    const contents: Content[] = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'I understand. I am Alpha\'s resume assistant and will only answer questions about Alpha\'s professional background using the search_resume function.' }] },
        { role: 'user', parts: [{ text: userQuestion }] }
    ];

    const config = {
        tools: [{ functionDeclarations: [searchResumeFn] }],
    };

    let response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config,
    });

    // Agentic loop
    while (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        console.log(`\n  [Searching resume for: "${functionCall.args?.query}"]`);

        const searchResults = await searchResume(functionCall.args?.query as string);
        console.log(`  [Found ${searchResults.length} relevant sections]\n`);

        // Add function call to history
        contents.push({
            role: 'model',
            parts: [{ functionCall: { name: functionCall.name, args: functionCall.args } }] as Part[]
        });

        // Add function result
        contents.push({
            role: 'user',
            parts: [{
                functionResponse: {
                    name: functionCall.name,
                    response: {
                        sections: searchResults.map(s => ({
                            category: s.category,
                            title: s.title,
                            content: s.content
                        }))
                    }
                }
            }] as Part[]
        });

        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config,
        });
    }

    return response.text || 'I could not generate a response.';
}

// Interactive CLI
async function startChat() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('\n' + '='.repeat(60));
    console.log('  Alpha\'s Resume Assistant');
    console.log('  Ask me anything about Alpha\'s professional background!');
    console.log('  Type "exit" to quit');
    console.log('='.repeat(60) + '\n');

    const prompt = () => {
        rl.question('You: ', async (input) => {
            const trimmed = input.trim();

            if (trimmed.toLowerCase() === 'exit') {
                console.log('\nGoodbye!\n');
                rl.close();
                process.exit(0);
            }

            if (!trimmed) {
                prompt();
                return;
            }

            try {
                const response = await askAboutResume(trimmed);
                console.log(`\nAssistant: ${response}\n`);
            } catch (error) {
                console.error('\nError:', (error as Error).message, '\n');
            }

            prompt();
        });
    };

    prompt();
}

// Main
async function main() {
    await initDb();

    // Load resume if not already loaded
    if (!(await isResumeLoaded())) {
        await loadResume();
    } else {
        const count = await sql`SELECT COUNT(*) as cnt FROM resume_sections`;
        console.log(`Resume already loaded (${count[0].cnt} sections)`);
    }

    // Start interactive chat
    await startChat();
}

main().catch(console.error);
