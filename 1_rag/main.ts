import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
import { neon } from '@neondatabase/serverless';

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

// Initialize the database with pgvector extension and table
async function initDb() {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    await sql`
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            embedding vector(3072)
        )
    `;
    console.log('Database initialized');
}

// Insert a document with its embedding
async function insertDocument(content: string) {
    const embedding = await getEmbedding(content);
    await sql`
        INSERT INTO documents (content, embedding)
        VALUES (${content}, ${JSON.stringify(embedding)})
    `;
    console.log(`Inserted: "${content.substring(0, 50)}..."`);
}

// Search for similar documents
async function searchSimilar(query: string, limit = 3) {
    const queryEmbedding = await getEmbedding(query);
    const results = await sql`
        SELECT content, 1 - (embedding <=> ${JSON.stringify(queryEmbedding)}) AS similarity
        FROM documents
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}
        LIMIT ${limit}
    `;
    return results;
}

async function main() {
    // Initialize database
    await initDb();

    // Sample documents to embed and store
    const documents = [
        "The quick brown fox jumps over the lazy dog.",
        "Machine learning is a subset of artificial intelligence.",
        "PostgreSQL is a powerful open-source relational database.",
        "Vector databases enable semantic search capabilities.",
        "The weather today is sunny with a chance of rain.",
    ];

    // Insert all documents
    console.log('\nInserting documents...');
    for (const doc of documents) {
        await insertDocument(doc);
    }

    // Perform a similarity search
    console.log('\n--- Similarity Search ---');
    const query = "How do AI and databases work together?";
    console.log(`Query: "${query}"\n`);

    const results = await searchSimilar(query);
    console.log('Most similar documents:');
    for (const row of results) {
        console.log(`  [${(row.similarity as number).toFixed(4)}] ${row.content}`);
    }
}

main().catch(console.error);
