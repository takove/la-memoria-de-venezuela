/**
 * Direct test of review queue with LLM curator
 */

const fs = require('fs');
const path = require('path');

// Read API key
function getApiKey() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/TOGETHER_API_KEY=(.+)/);
    return match ? match[1].trim() : null;
  } catch (error) {
    return null;
  }
}

const TOGETHER_API_KEY = getApiKey();
const BASE_URL = 'https://api.together.xyz/v1';
const MODEL = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';

async function testSuspiciousEntity() {
  console.log('🧪 Testing LLM Review for Suspicious Entity\n');

  // Simulate a geographic term misclassified as PERSON
  const testEntity = {
    rawText: 'Caracas',
    normText: 'caracas',
    type: 'PERSON',
    confidenceScore: 3,
  };

  const articleContext = 'El ministro Caracas habló con Venezuela sobre la crisis política.';

  console.log('📝 Test Entity:', testEntity);
  console.log('📄 Article Context:', articleContext);
  console.log('\n🔍 Sending to Llama for review...\n');

  const prompt = `You are a compliance curator for an accountability database documenting Venezuelan regime officials.

**Entity to Review:**
- Extracted Text: "${testEntity.rawText}"
- Normalized: "${testEntity.normText}"
- Type: ${testEntity.type}
- Our Confidence Score: ${testEntity.confidenceScore}/5 (CREDIBLE - moderate evidence)
- Language: es

**Article Context:**
"${articleContext}"

**Your Task:**
1. Assess risk of this being a false positive (innocent person misidentified as regime-connected)
2. Consider if the name is too common, generic, or ambiguous
3. Check for mistranslations or OCR errors
4. Suggest the correct entity type
5. Recommend whether to APPROVE (auto-add if confidence ≥4), FLAG (needs human review), or INVESTIGATE (might be error/duplicate)

**Format your response as:**
RECOMMENDATION: [APPROVE|FLAG|INVESTIGATE]
CONFIDENCE: [0.0-1.0] how confident are you in this decision?
EXPLANATION: [2-3 sentences explaining your decision]
CATEGORY: [PERSON|ORG|LOCATION|ASSET]
ISSUES: [list any concerns, or "None" if clean]

Remember: We would rather miss 10 guilty people than wrongly accuse 1 innocent person. When in doubt, recommend FLAG for human review.`;

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      return;
    }

    const data = await response.json();
    const llmResponse = data.choices?.[0]?.message?.content || '';

    console.log(`✅ Response in ${duration}ms\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LLM REVIEW:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(llmResponse);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Parse
    const recMatch = llmResponse.match(/RECOMMENDATION:\s*(APPROVE|FLAG|INVESTIGATE)/i);
    const confMatch = llmResponse.match(/CONFIDENCE:\s*([\d.]+)/i);
    const catMatch = llmResponse.match(/CATEGORY:\s*(PERSON|ORG|LOCATION|ASSET)/i);

    console.log('📊 PARSED RESULTS:');
    console.log('  Recommendation:', recMatch ? recMatch[1] : 'NOT FOUND');
    console.log('  Confidence:', confMatch ? confMatch[1] : 'NOT FOUND');
    console.log('  Suggested Category:', catMatch ? catMatch[1] : 'NOT FOUND');
    
    const shouldFlag = recMatch && recMatch[1].toUpperCase() !== 'APPROVE';
    const correctCategory = catMatch && catMatch[1] === 'LOCATION';
    
    console.log('\n✅ TEST RESULTS:');
    console.log('  LLM detected false positive:', shouldFlag ? '✓ YES' : '✗ NO');
    console.log('  Correct category identified:', correctCategory ? '✓ YES' : '✗ NO');
    
    if (shouldFlag && correctCategory) {
      console.log('\n🎉 SUCCESS: LLM correctly flagged "Caracas" as a geographic term misclassified as PERSON!');
    } else {
      console.log('\n⚠️  LLM did not flag this as suspicious. This might be expected behavior.');
    }

    console.log('\n💰 Cost:', `$${((data.usage.prompt_tokens * 0.9 / 1000000) + (data.usage.completion_tokens * 1.2 / 1000000)).toFixed(6)}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSuspiciousEntity();
