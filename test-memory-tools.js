// Sample test code for memory tools
const fetch = require("node-fetch");

async function testKnowledgeGraphMemoryFeatures() {
  console.log("Testing Knowledge Graph Memory Features...");

  // Test memory search (previously on Titan Memory)
  try {
    const searchResponse = await fetch(
      "http://localhost:3004/api/tools/search_memory",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "test query", limit: 5 }),
      }
    );

    console.log(`Memory Search Status: ${searchResponse.status}`);
    // Additional tests...
  } catch (error) {
    console.error(`Memory Search Error: ${error.message}`);
  }
}

testKnowledgeGraphMemoryFeatures();
