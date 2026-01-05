/**
 * Quick test script for Together.AI LLM Curator
 * Run with: TOGETHER_API_KEY=your-key node test-llm-curator.js
 * Or just: node test-llm-curator.js (reads from .env manually)
 */

const fs = require('fs');
const path = require('path');

// Read API key from .env file
function getApiKey() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TOGETHER_API_KEY=(.+)/);
    return match ? match[1].trim() : null;
  } catch (error) {
    return process.env.TOGETHER_API_KEY || null;
  }
}

const TOGETHER_API_KEY = getApiKey();
const BASE_URL = 'https://api.together.xyz/v1';
const MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';

async function testLlmCurator() {
  console.log('🔍 Testing LLM Curator with Together.AI...\n');

  if (!TOGETHER_API_KEY || TOGETHER_API_KEY === 'your-together-api-key-here') {
    console.error('❌ TOGETHER_API_KEY not configured in .env');
    process.exit(1);
  }

  console.log('✅ API Key found:', TOGETHER_API_KEY.substring(0, 10) + '...');
  console.log('🤖 Model:', MODEL);
  console.log('🌐 Endpoint:', BASE_URL + '/chat/completions\n');

  const prompt = `You are a compliance curator for an accountability database documenting Venezuelan regime officials.

**Entity to Review:**
- Extracted Text: "Nicolás Maduro"
- Normalized: "nicolas maduro"
- Type: PERSON
- Our Confidence Score: 5/5 (OFFICIAL)
- Language: es

**Article Context:**
"El presidente Nicolás Maduro anunció nuevas medidas económicas durante una reunión con ministros..."

**Your Task:**
1. Assess risk of this being a false positive
2. Consider if the name is too common or ambiguous
3. Recommend whether to APPROVE, FLAG, or INVESTIGATE

**Format your response as:**
RECOMMENDATION: [APPROVE|FLAG|INVESTIGATE]
CONFIDENCE: [0.0-1.0]
EXPLANATION: [2-3 sentences]
CATEGORY: [PERSON|ORG|LOCATION|ASSET]
ISSUES: [concerns or "None"]`;

  try {
    console.log('📤 Sending request to Together.AI...\n');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      process.exit(1);
    }

    const data = await response.json();
    const llmResponse = data.choices?.[0]?.message?.content || '';

    console.log('📥 Response received in', duration, 'ms\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LLM RESPONSE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(llmResponse);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Parse the response
    const recMatch = llmResponse.match(/RECOMMENDATION:\s*(APPROVE|FLAG|INVESTIGATE)/i);
    const confMatch = llmResponse.match(/CONFIDENCE:\s*([\d.]+)/i);
    const explMatch = llmResponse.match(/EXPLANATION:\s*(.+?)(?:CATEGORY:|$)/is);
    const catMatch = llmResponse.match(/CATEGORY:\s*(PERSON|ORG|LOCATION|ASSET)/i);

    console.log('✅ PARSED RESULTS:');
    console.log('  Recommendation:', recMatch ? recMatch[1] : 'NOT FOUND');
    console.log('  Confidence:', confMatch ? confMatch[1] : 'NOT FOUND');
    console.log('  Category:', catMatch ? catMatch[1] : 'NOT FOUND');
    console.log('  Explanation:', explMatch ? explMatch[1].trim().substring(0, 100) + '...' : 'NOT FOUND');
    console.log('\n🎉 LLM Curator test successful!\n');

    // Usage stats
    if (data.usage) {
      console.log('📊 Token Usage:');
      console.log('  Prompt:', data.usage.prompt_tokens);
      console.log('  Completion:', data.usage.completion_tokens);
      console.log('  Total:', data.usage.total_tokens);
      const cost = (data.usage.prompt_tokens * 0.9 / 1000000) + (data.usage.completion_tokens * 1.2 / 1000000);
      console.log('  Estimated cost: $' + cost.toFixed(6));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testLlmCurator();
