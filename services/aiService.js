// services/aiService.js
import api from "./api";

/**
 * Send message to SwiftRide AI Bot
 * @param {string} message - User's message
 * @param {Array} history - Chat history [{role: 'user'|'model', content: string}]
 * @returns {Promise} Bot's reply
 */
export const chatWithBot = async (message, history = []) => {
    const response = await api.post("/ai/chat", { message, history });
    return response.data;
};

export default { chatWithBot };
