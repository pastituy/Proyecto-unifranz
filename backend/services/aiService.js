const fetch = require('node-fetch');

const DEFAULT_BASE_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Calls a chat-completions endpoint compatible with the OpenAI API format.
 * Provider, model, key and URL are all configured via env vars so any
 * compatible provider (OpenAI, Gemini, OpenRouter, Groq, DeepSeek, etc.)
 * can be used without code changes.
 * @param {string} model - Model to use (falls back to AI_MODEL env var).
 * @param {Array} messages - The messages to send to the model.
 * @param {number} max_tokens - The maximum number of tokens to generate.
 * @returns {Promise<Object>} - The response from the AI provider.
 */
const callAI = async ({ model, messages, max_tokens }) => {
  const resolvedModel = model || process.env.AI_MODEL;
  const baseUrl = process.env.AI_BASE_URL || DEFAULT_BASE_URL;
  const apiKey = process.env.AI_API_KEY;

  console.log("--- AI Service: Incoming Payload ---");
  console.log(JSON.stringify({ baseUrl, model: resolvedModel, messages, max_tokens }, null, 2));

  if (!apiKey) {
    throw new Error('AI_API_KEY is not configured in .env');
  }

  if (!resolvedModel) {
    throw new Error('AI_MODEL is not configured in .env and no model was provided');
  }

  const body = {
    model: resolvedModel,
    messages,
    max_tokens
  };

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  console.log("--- AI Service: Outgoing Payload ---");
  console.log(JSON.stringify(data, null, 2));

  return {
    ok: response.ok,
    status: response.status,
    data
  };
};

/**
 * Extracts a human-readable error message from a provider's error response.
 * Providers don't all agree on the shape: most return `{ error: { message } }`
 * (OpenAI-style), but some (e.g. Gemini) return an array `[{ error: { message } }]`.
 * @param {Object|Array} data - The raw response body from the provider.
 * @returns {string|undefined}
 */
const extractErrorMessage = (data) => {
  const errorObj = Array.isArray(data) ? data[0]?.error : data?.error;
  return errorObj?.message;
};

module.exports = {
  callAI,
  extractErrorMessage
};
