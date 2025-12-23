const fetch = require('node-fetch');

/**
 * Calls the OpenRouter API with the given parameters.
 * @param {string} model - The model to use for the completion.
 * @param {Array} messages - The messages to send to the model.
 * @param {number} max_tokens - The maximum number of tokens to generate.
 * @returns {Promise<Object>} - The response from the OpenRouter API.
 */
const callOpenRouter = async ({ model, messages, max_tokens, xTitle = 'Baneco Chatbot' }) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured in .env');
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': xTitle
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens
    })
  });

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data
  };
};

module.exports = {
  callOpenRouter
};
