/**
 * AI Configuration Module
 * Manages Ollama connection and AI model settings
 */

import axios from "axios";
import logger from "../config/logger.js";

// Ollama Configuration
const OLLAMA_CONFIG = {
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
  model: process.env.AI_MODEL || "mistral",
  timeout: parseInt(process.env.AI_TIMEOUT || "30000", 10),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "1024", 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
};

// Create Ollama API client
const ollamaClient = axios.create({
  baseURL: OLLAMA_CONFIG.host,
  timeout: OLLAMA_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Check if Ollama service is available
 */
export const checkOllamaHealth = async () => {
  try {
    const response = await ollamaClient.get("/api/tags");
    logger.info("Ollama service is healthy", {
      models: response.data.models?.length || 0,
    });
    return true;
  } catch (error) {
    logger.error("Ollama service health check failed", {
      error: error.message,
      host: OLLAMA_CONFIG.host,
    });
    return false;
  }
};

/**
 * Send request to Ollama AI model
 * @param {string} prompt - The prompt to send to the model
 * @param {object} options - Generation options
 * @returns {Promise<string>} - AI model response
 */
export const generateAIResponse = async (prompt, options = {}) => {
  try {
    const requestPayload = {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      stream: false,
      temperature: options.temperature || OLLAMA_CONFIG.temperature,
      top_p: options.topP || 0.9,
      top_k: options.topK || 40,
      num_predict: options.numPredict || OLLAMA_CONFIG.maxTokens,
    };

    logger.info("Sending request to Ollama", {
      model: OLLAMA_CONFIG.model,
      promptLength: prompt.length,
      host: OLLAMA_CONFIG.host,
    });

    const response = await ollamaClient.post("/api/generate", requestPayload);

    if (!response.data || !response.data.response) {
      const errorMsg = `Invalid response from Ollama: ${JSON.stringify(response.data)}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    logger.info("Received response from Ollama", {
      responseLength: response.data.response.length,
    });

    return response.data.response.trim();
  } catch (error) {
    logger.error("Error generating AI response", {
      error: error.message,
      model: OLLAMA_CONFIG.model,
      host: OLLAMA_CONFIG.host,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
    });

    // Provide more context about the error
    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("ECONNREFUSED")
    ) {
      throw new Error(
        `Cannot connect to Ollama at ${OLLAMA_CONFIG.host}. Please start Ollama service.`,
      );
    }

    if (error.response?.status === 404 || error.message.includes("model")) {
      throw new Error(
        `Ollama model '${OLLAMA_CONFIG.model}' not found. Please pull it using: ollama pull ${OLLAMA_CONFIG.model}`,
      );
    }

    if (error.code === "ENOTFOUND") {
      throw new Error(
        `Cannot reach Ollama host: ${OLLAMA_CONFIG.host}. Check your OLLAMA_HOST environment variable.`,
      );
    }

    throw new Error(`Ollama Error: ${error.message}`);
  }
};

/**
 * Stream AI response (for real-time output)
 * @param {string} prompt - The prompt to send
 * @param {function} onData - Callback for each token
 * @param {object} options - Generation options
 */
export const streamAIResponse = async (prompt, onData, options = {}) => {
  try {
    const requestPayload = {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      stream: true,
      temperature: options.temperature || OLLAMA_CONFIG.temperature,
    };

    const response = await ollamaClient.post("/api/generate", requestPayload, {
      responseType: "stream",
    });

    response.data.on("data", (chunk) => {
      try {
        const lines = chunk.toString().split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            const data = JSON.parse(line);
            if (data.response) {
              onData(data.response);
            }
          }
        });
      } catch (error) {
        logger.error("Error parsing stream data", { error: error.message });
      }
    });

    response.data.on("error", (error) => {
      logger.error("Stream error", { error: error.message });
    });

    return new Promise((resolve, reject) => {
      response.data.on("end", () => resolve());
      response.data.on("error", reject);
    });
  } catch (error) {
    logger.error("Error streaming AI response", { error: error.message });
    throw error;
  }
};

/**
 * Get Ollama model list
 * @returns {Promise<array>} - List of available models
 */
export const getAvailableModels = async () => {
  try {
    const response = await ollamaClient.get("/api/tags");
    return response.data.models || [];
  } catch (error) {
    logger.error("Error fetching available models", { error: error.message });
    return [];
  }
};

/**
 * Test AI connection
 * @returns {Promise<boolean>} - Connection status
 */
export const testAIConnection = async () => {
  try {
    const prompt = 'Say "OK" to confirm connection.';
    const response = await generateAIResponse(prompt, {
      temperature: 0.1,
      numPredict: 50,
    });
    return response.toLowerCase().includes("ok");
  } catch (error) {
    logger.error("AI connection test failed", { error: error.message });
    return false;
  }
};

export default {
  ollamaClient,
  OLLAMA_CONFIG,
  checkOllamaHealth,
  generateAIResponse,
  streamAIResponse,
  getAvailableModels,
  testAIConnection,
};
