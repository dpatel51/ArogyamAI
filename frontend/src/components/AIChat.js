import React, { useState, useRef, useEffect } from 'react';
import './AIChat.css';

// Backend API URL (proxy to ADK agent)
const API_BASE_URL = 'http://localhost:3000/api';

function AIChat({ hospitalId, activeTab }) {
    const [ messages, setMessages ] = useState([
        {
            type: 'agent',
            text: 'Hello! I\'m your AI assistant for hospital surge management. I can help you with inventory, staffing, beds, and procurement. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [ input, setInput ] = useState('');
    const [ isTyping, setIsTyping ] = useState(false);
    const [ sessionInitialized, setSessionInitialized ] = useState(false);
    const [ sessionId, setSessionId ] = useState(null);
    const messagesEndRef = useRef(null);

    // Generate unique user ID based on hospitalId
    const userId = `user_${hospitalId || 'default'}`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [ messages ]);

    // Initialize session with Google ADK Agent via backend proxy
    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Generate unique session ID
                const newSessionId = `session_${hospitalId || 'default'}_${Date.now()}`;

                const response = await fetch(`${API_BASE_URL}/ai-agent/session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        sessionId: newSessionId,
                        initialState: {
                            hospitalId: hospitalId,
                            activeTab: activeTab
                        }
                    }),
                });

                const data = await response.json();

                if (response.ok || data.message?.includes('already exists')) {
                    // Session created or already exists - store the session ID
                    setSessionId(newSessionId);
                    setSessionInitialized(true);
                    console.log('ADK Agent session initialized:', newSessionId);
                } else {
                    console.error('Failed to initialize session');
                }
            } catch (error) {
                console.error('Error initializing ADK session:', error);
                // Continue with mock responses if ADK is unavailable
                setSessionInitialized(false);
            }
        };

        initializeSession();
    }, []);

    const quickCommands = [
        { label: '📊 Check Status', command: 'Check inventory status' },
        { label: '⚠️ View Alerts', command: 'Show me critical items' },
        { label: '🛒 Auto Order', command: 'Generate purchase orders' },
    ];

    const handleSend = async () => {
        if (!input.trim()) return;

        // Check if session is initialized
        if (!sessionId) {
            console.error('Session not initialized yet');
            return;
        }

        const userMessage = {
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [ ...prev, userMessage ]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        try {
            // Call Google ADK Agent API via backend proxy using the stored session ID
            const response = await fetch(`${API_BASE_URL}/ai-agent/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    sessionId: sessionId,
                    message: currentInput
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from ADK agent');
            }

            const data = await response.json();
            const aiResponse = data.response || 'No response from agent';

            setMessages(prev => [ ...prev, {
                type: 'agent',
                text: aiResponse,
                timestamp: new Date()
            } ]);
        } catch (error) {
            console.error('Error calling ADK agent:', error);
            // Fallback to mock response if ADK is unavailable
            const fallbackResponse = generateAIResponse(currentInput, activeTab);
            setMessages(prev => [ ...prev, {
                type: 'agent',
                text: fallbackResponse + '\n\n⚠️ (Using fallback - ADK agent unavailable)',
                timestamp: new Date()
            } ]);
        } finally {
            setIsTyping(false);
        }
    };

    // Fallback response generator (used when ADK agent is unavailable)
    const generateAIResponse = (query, tab) => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('status') || lowerQuery.includes('check')) {
            return `I've analyzed the current ${tab} data. Everything is being monitored. Would you like me to provide detailed insights or generate reports?`;
        } else if (lowerQuery.includes('alert') || lowerQuery.includes('critical')) {
            return `🚨 Found 3 critical items requiring attention:\n• N95 Masks - Below reorder level\n• Ventilators - Critically low\n• ICU Beds - 84% occupancy\n\nShould I create purchase orders?`;
        } else if (lowerQuery.includes('order') || lowerQuery.includes('purchase')) {
            return `✅ I can generate purchase orders for low-stock items. Based on current inventory:\n• N95 Masks: 500 units needed\n• Ventilators: 5 units needed\n\nTotal estimated cost: ₹1,85,000\n\nShall I proceed?`;
        } else {
            return `I understand you're asking about "${query}". I'm here to help with inventory management, staffing allocation, bed capacity monitoring, and automated procurement. What specific information do you need?`;
        }
    };

    const handleQuickCommand = (command) => {
        setInput(command);
        handleSend();
    };

    return (
        <div className="ai-chat-container">
            <div className="chat-header">
                <h3 className="chat-title">🤖 AI Assistant</h3>
                <span className="chat-subtitle">Powered by AI</span>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                        <div className="message-content">
                            <div className="message-text">{msg.text}</div>
                            <div className="message-time">
                                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message agent">
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-quick-commands">
                <div className="quick-commands-title">💡 Quick Commands:</div>
                <div className="quick-commands-grid">
                    {quickCommands.map((cmd, idx) => (
                        <button
                            key={idx}
                            className="quick-command-btn"
                            onClick={() => handleQuickCommand(cmd.command)}
                        >
                            {cmd.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="chat-send-btn" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default AIChat;
