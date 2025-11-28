const express = require('express');
const router = express.Router();

// Configuration for Google ADK Agent
const ADK_AGENT_URL = process.env.ADK_AGENT_URL || 'http://127.0.0.1:8000';
const ADK_APP_NAME = process.env.ADK_APP_NAME || 'test-agent-mcp';

/**
 * Create or get a session for a user
 * POST /api/ai-agent/session
 */
router.post('/session', async (req, res) => {
    try {
        const { userId, sessionId, initialState = {} } = req.body;

        if (!userId || !sessionId) {
            return res.status(400).json({ error: 'userId and sessionId are required' });
        }

        const sessionUrl = `${ADK_AGENT_URL}/apps/${ADK_APP_NAME}/users/${userId}/sessions/${sessionId}`;

        const response = await fetch(sessionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(initialState),
        });

        const data = await response.json();

        if (!response.ok) {
            // If session already exists, that's okay
            if (data.detail && data.detail.includes('already exists')) {
                return res.json({ message: 'Session already exists', sessionId });
            }
            throw new Error(data.detail || 'Failed to create session');
        }

        res.json({ message: 'Session created successfully', session: data });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: error.message || 'Failed to create session' });
    }
});

/**
 * Send a query to the AI agent
 * POST /api/ai-agent/query
 */
router.post('/query', async (req, res) => {
    try {
        const { userId, sessionId, message } = req.body;

        if (!userId || !sessionId || !message) {
            return res.status(400).json({ error: 'userId, sessionId, and message are required' });
        }

        const queryUrl = `${ADK_AGENT_URL}/run`;

        const requestBody = {
            appName: ADK_APP_NAME,
            userId: userId,
            sessionId: sessionId,
            newMessage: {
                role: 'user',
                parts: [ {
                    text: message
                } ]
            }
        };

        const response = await fetch(queryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to query agent');
        }

        const events = await response.json();

        // Extract the final text response from the events
        const textResponse = extractTextFromEvents(events);

        res.json({
            success: true,
            response: textResponse,
            events: events
        });
    } catch (error) {
        console.error('Error querying agent:', error);
        res.status(500).json({ error: error.message || 'Failed to query agent' });
    }
});

/**
 * Helper function to extract text response from ADK events
 */
function extractTextFromEvents(events) {
    if (!Array.isArray(events)) {
        return 'No response from agent';
    }

    // Find the last event with text content from the model
    for (let i = events.length - 1; i >= 0; i--) {
        const event = events[ i ];
        if (event.content && event.content.role === 'model' && event.content.parts) {
            for (const part of event.content.parts) {
                if (part.text) {
                    return part.text.trim();
                }
            }
        }
    }

    return 'No response from agent';
}

module.exports = router;
