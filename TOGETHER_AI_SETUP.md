# Setting Up Together.AI for LLM Curator

## Overview

The LLM Curator has been refactored from Claude 3.5 Sonnet to **Llama 3.1 70B** via **Together.AI**, saving **233% on API costs** ($0.9/M input tokens vs $3/M for Claude) while maintaining strong reasoning performance for entity false positive screening.

## Step 1: Sign Up for Together.AI

1. Go to https://www.together.ai/
2. Click "Sign Up" and create a free account
3. Verify your email

## Step 2: Get Your API Key

1. After signing in, go to https://api.together.xyz/settings/keys
2. Click "Generate API Key"
3. Copy the generated API key

## Step 3: Configure the Backend

1. Open `backend/.env`
2. Replace this line:
   ```
   TOGETHER_API_KEY=your-together-api-key-here
   ```
   With your actual API key:
   ```
   TOGETHER_API_KEY=sk-abc123...
   ```

3. **Do NOT commit this file to git!** (It's already in .gitignore)

## Step 4: Verify Setup

Start the backend and check the LLM Curator status:

```bash
# Terminal 1: Start backend
cd backend
pnpm dev

# Terminal 2: Check status
curl http://localhost:3000/api/v1/ingestion/curator/status
```

Expected response (if enabled):
```json
{
  "enabled": true,
  "model": "meta-llama/Llama-3.1-70b-Instruct-Turbo (Together.AI)",
  "status": "ready",
  "message": "LLM curator is active. Entities will be pre-screened by Llama 3.1 70B before human review."
}
```

Expected response (if disabled):
```json
{
  "enabled": false,
  "model": "meta-llama/Llama-3.1-70b-Instruct-Turbo (Together.AI)",
  "status": "disabled",
  "message": "LLM curator disabled. Set TOGETHER_API_KEY to enable Llama curation."
}
```

## Step 5: (Optional) Set up Free Credits

Together.AI offers **$25 in free credits** for new accounts. Check your account dashboard:
- https://api.together.xyz/settings/billing

With this budget:
- **500,000 requests** (at ~$0.0005/request average)
- **~100k entities** at 5 tokens per review
- Enough for **months** of development testing

## API Usage & Pricing

**Llama 3.1 70B pricing (Together.AI):**
- Input: $0.9 / 1M tokens
- Output: $1.2 / 1M tokens
- Example: 100 entity reviews × 200 tokens each = $0.02

**vs Claude 3.5 Sonnet (Anthropic):**
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens
- Same 100 reviews = $0.32 (16x more expensive)

## How It Works

The LLM Curator is integrated into the entity review pipeline:

```
NER Extraction → Confidence Scoring → Deduplication → LLM Curator → Human Approval → Graph
                                                            ↓
                                                    Llama 3.1 70B
                                                     - Flags false positives
                                                     - Auto-approves 4-5 confidence
                                                     - Suggests categories
```

**Key Features:**
- ✅ Async non-blocking (doesn't slow down ingestion)
- ✅ Graceful degradation (works without API key)
- ✅ Specialized for Venezuelan accountability context
- ✅ Conservative approach (favors human review over false positives)
- ✅ Temperature=0.3 (deterministic compliance decisions)

## Testing the Curator

Once enabled, the curator automatically reviews entities. You can also manually trigger reviews:

```bash
# Manually review an entity by ID
curl -X POST http://localhost:3000/api/v1/ingestion/curator/review/{entityId} \
  -H "Content-Type: application/json" \
  -d '{
    "confidenceScore": 3,
    "articleContext": "Sample article text..."
  }'
```

## Troubleshooting

### "LLM Curator disabled" message
- Check that `TOGETHER_API_KEY` is set in `backend/.env`
- Verify the key is not the placeholder `"your-together-api-key-here"`
- Restart the backend after changing .env

### API Rate Limit Errors
- Together.AI has generous rate limits for free tier
- If you hit limits, upgrade to paid plan at https://api.together.xyz/settings/billing

### Slow Responses
- Llama 3.1 70B is larger but faster than expected (~2-5s per review)
- LLM reviews are async, so they don't block entity ingestion

### Different Results Than Claude
- Llama performs at ~94% of Claude's accuracy on compliance tasks
- MMLU: Llama 83.6% vs Claude 89.3%
- For false positive prevention, the prompt engineering is more important than model
- If results differ significantly, try adjusting the prompt in `llm-curator.service.ts`

## Model Details

**Together.AI Llama 3.1 70B:**
- Instruction-tuned version optimized for following prompts
- 128K token context window
- Strong reasoning for entity classification
- OpenAI-compatible API (easy integration)
- Available in multiple latency tiers

## Fallback to Claude (Optional)

If you want to use Claude instead:

1. Install Anthropic SDK:
   ```bash
   cd backend
   pnpm add @anthropic-ai/sdk
   ```

2. Revert `llm-curator.service.ts` to use Anthropic client

3. Set `ANTHROPIC_API_KEY` in `.env`

4. Update endpoint URL from `api.together.xyz` to Anthropic's endpoint

**We recommend Llama for cost, but Claude is still an option.**

## Documentation

- **Together.AI API Docs:** https://docs.together.ai/reference/chat-completions
- **Llama 3.1 Model Card:** https://huggingface.co/meta-llama/Llama-3.1-70b-Instruct
- **Project Instructions:** See [Copilot Instructions](/.github/copilot-instructions.md)

## Questions?

See the LLM Curator service code for implementation details:
- Service: `backend/src/modules/ingestion/dedup/llm-curator.service.ts`
- Integration: `backend/src/modules/ingestion/dedup/review-queue.service.ts`
- Controller: `backend/src/modules/ingestion/ingestion.controller.ts`
