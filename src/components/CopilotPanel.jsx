import { useState, useEffect, useRef } from "react";

const CopilotPanel = ({ activeChat, messages = [], onAddToComposer }) => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [savedResponses, setSavedResponses] = useState([]);
  const [showSavedResponses, setShowSavedResponses] = useState(false);

  // Dynamic suggested questions based on conversation context
  const getSuggestedQuestions = () => {
    const lastMessage =
      messages[messages.length - 1]?.text?.toLowerCase() || "";

    if (lastMessage.includes("refund") || lastMessage.includes("return")) {
      return [
        "How do I process a refund?",
        "What's our refund policy?",
        "Generate a refund confirmation email",
      ];
    } else if (
      lastMessage.includes("order") ||
      lastMessage.includes("shipping")
    ) {
      return [
        "Track order status",
        "Shipping delay response template",
        "How to update shipping address?",
      ];
    } else if (
      lastMessage.includes("account") ||
      lastMessage.includes("password")
    ) {
      return [
        "Account recovery steps",
        "Password reset template",
        "Security verification process",
      ];
    }

    return [
      "How do I process a refund?",
    ];
  };

  const suggestedQuestions = getSuggestedQuestions();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatHistory.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, streamingText]);

  // Clear chat history when switching between different customers
  useEffect(() => {
    setChatHistory([]);
    setStreamingText("");
  }, [activeChat]);

  // Load saved responses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedCopilotResponses");
    if (saved) {
      setSavedResponses(JSON.parse(saved));
    }
  }, []);

  // Simulate streaming response
  const simulateStreaming = async (fullText, messageId) => {
    setIsStreaming(true);
    setStreamingText("");

    const words = fullText.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const updatedText = (i > 0 ? currentText + " " : "") + word;
      currentText = updatedText; // update outer context

      // Avoid closure issues
      const textForUpdate = updatedText;

      setStreamingText(textForUpdate);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, text: textForUpdate, isStreaming: true }
            : msg
        )
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 30 + Math.random() * 50)
      );
    }
    

    // Final update with complete text
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, text: fullText, isStreaming: false }
          : msg
      )
    );

    setIsStreaming(false);
    setStreamingText("");
  };

  // OpenAI API call with streaming simulation
  const callOpenAI = async (userQuery) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: `You are Fin AI, a helpful customer service copilot assistant. You help customer service agents by analyzing conversations and providing helpful suggestions, draft responses, and guidance.
                
                Current conversation context:
                - Customer: ${activeChat?.split(" · ")[0] || "Unknown"}
                - Company: ${activeChat?.split(" · ")[1] || "N/A"}
                - Messages in conversation: ${messages.length}
                
                Recent conversation:
                ${messages
                  .slice(-5)
                  .map((m) => `${m.sender}: ${m.text}`)
                  .join("\n")}
                
                Provide helpful, professional, and actionable advice for customer service agents. Include specific templates they can use. Keep responses concise and practical.`,
              },
              {
                role: "user",
                content: userQuery,
              },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  };

  // Enhanced local AI responses with more intelligence
  const getLocalResponse = (question) => {
    const q = question.toLowerCase();
    const customerName = activeChat?.split(" · ")[0] || "the customer";

    // Analyze conversation sentiment
    const lastUserMessage =
      messages.filter((m) => m.sender === "user").pop()?.text || "";
    const sentiment =
      lastUserMessage.includes("frustrated") ||
      lastUserMessage.includes("disappointed")
        ? "frustrated"
        : "neutral";

    // Refund questions with sentiment awareness
    if (q.includes("refund") || q.includes("return")) {
      const empathyNote =
        sentiment === "frustrated"
          ? "I completely understand your frustration, and I sincerely apologize for any inconvenience this has caused. "
          : "";

      return `${empathyNote}We understand that sometimes a purchase may not meet your expectations, and you may need to request a refund.

To assist you with your refund request, could you please provide your order ID and proof of purchase.

Please note:
We can only refund orders placed within the last 60 days, and your item must meet our requirements for condition to be returned. Please check when you placed your order before proceeding.

Once I've checked these details, if everything looks OK, I will send a returns QR code which you can use to post the item back to us. Your refund will be automatically issued once you put it in the post.

**Quick Actions:**
• Check order eligibility ✓
• Generate return label ✓
• Send confirmation email ✓`;
    }

    // Account creation with personalization
    if (q.includes("create") && q.includes("account")) {
      return `I'd be happy to help ${customerName} create an account!

Here's how to get started:
1. Visit our website and click on "Sign Up" in the top right corner
2. Enter your email address and create a secure password
3. Fill in your personal details (name and phone number)
4. Check your email for a verification link
5. Click the link to activate your account

**Benefits of creating an account:**
• Track orders in real-time
• Save favorite products
• Faster checkout
• Exclusive member offers

Once your account is created, you'll be able to track orders, save your preferences, and enjoy faster checkout. Would you like me to guide you through any specific step?`;
    }

    // Smart response generation
    if (
      q.includes("generate") ||
      q.includes("template") ||
      q.includes("response")
    ) {
      // const context = messages[messages.length - 1]?.text || "";
      return `Based on the conversation, here's a professional response template:

"Hi ${customerName},

Thank you for reaching out to us. ${
        sentiment === "frustrated"
          ? "I understand your concerns and I'm here to help resolve this immediately."
          : "I'd be happy to assist you with this."
      }

[Personalize based on their specific issue]

Next steps:
1. [First action item]
2. [Second action item]
3. [Timeline expectation]

Is there anything else I can help you with today?

Best regards,
[Your name]"

**Tone suggestions:**
• Empathetic and understanding
• Solution-focused
• Clear on next steps`;
    }

    // Login/password issues
    if (q.includes("password") || q.includes("login") || q.includes("forgot")) {
      return `I understand you're having trouble accessing your account. Let me help you reset your password.

To reset your password:
1. Go to our login page and click "Forgot Password?"
2. Enter the email address associated with your account
3. Check your email for a password reset link (it should arrive within 5 minutes)
4. Click the link and create a new password

If you don't receive the email, please check your spam folder. If you're still having issues, I can help verify your identity and manually reset your password for you.`;
    }

    // Billing/payment
    if (
      q.includes("billing") ||
      q.includes("payment") ||
      q.includes("charge")
    ) {
      return `I'll be happy to help you with your billing inquiry.

To better assist you, could you please let me know:
- The specific charge or billing issue you're experiencing
- The date and amount of the charge in question
- The email address associated with your account

Once I have this information, I can review your payment history and help resolve any billing concerns you may have.`;
    }

    // Shipping/delivery
    if (
      q.includes("shipping") ||
      q.includes("delivery") ||
      q.includes("track")
    ) {
      return `I can definitely help you track your order!

To track your shipment:
- If you have your order confirmation email, you'll find the tracking number there
- You can also log into your account and view your order history
- Standard shipping typically takes 3-7 business days

Could you please provide your order number or the email address used for the purchase? I'll look up the current status of your delivery right away.`;
    }

    // Technical issues
    if (q.includes("bug") || q.includes("error") || q.includes("not working")) {
      return `I'm sorry to hear you're experiencing technical difficulties. Let me help troubleshoot this issue.

To better assist you:
1. Could you describe exactly what error message or issue you're seeing?
2. What device and browser are you using?
3. When did this issue first start occurring?

In the meantime, you can try:
- Clearing your browser cache and cookies
- Trying a different browser or incognito/private mode
- Checking if you have any browser extensions that might interfere

I'll make sure we get this resolved for you quickly.`;
    }

    // General intelligent response
    return `Thank you for your question about "${question}".

Based on the current conversation with ${customerName}, here are my recommendations:

**Immediate Actions:**
1. Acknowledge their concern
2. Gather any missing information
3. Provide clear next steps

**Suggested Response Framework:**
• Opening: Acknowledge and empathize
• Middle: Explain the solution/process
• Closing: Set expectations and offer further help

**Resources:**
• Knowledge base article: #KB-${Math.floor(Math.random() * 9000) + 1000}
• Similar cases: ${Math.floor(Math.random() * 50) + 10} resolved this week
• Average resolution time: ${Math.floor(Math.random() * 24) + 1} hours

Would you like me to generate a specific response template?`;
  };

  const askFinAI = async (question) => {
    // Prevent rapid requests
    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      // Reduced to 2 seconds
      const waitTime = Math.ceil((2000 - (now - lastRequestTime)) / 1000);

      const warningMessage = {
        id: Date.now() + 1,
        sender: "fin",
        text: `⏰ Please wait ${waitTime} more second${
          waitTime > 1 ? "s" : ""
        } to avoid rate limits.`,
        timestamp: Date.now(),
        sources: [],
        isWarning: true,
      };

      setChatHistory((prev) => [...prev, warningMessage]);
      return;
    }

    setLastRequestTime(now);
    setIsLoading(true);

    // Add user question to chat
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: question,
      timestamp: Date.now(),
    };

    setChatHistory((prev) => [...prev, userMessage]);

    try {
      let aiResponse;

      // Try OpenAI first if API key exists
      if (process.env.REACT_APP_OPENAI_API_KEY) {
        try {
          aiResponse = await callOpenAI(question);
        } catch (error) {
          console.log("Falling back to local AI:", error.message);
          aiResponse = getLocalResponse(question);
        }
      } else {
        aiResponse = getLocalResponse(question);
      }

      // Add AI response to chat with streaming
      const finMessage = {
        id: Date.now() + 1,
        sender: "fin",
        text: "",
        timestamp: Date.now(),
        sources: generateSmartSources(question),
        metrics: generateMetrics(question),
        isStreaming: true,
      };

      setChatHistory((prev) => [...prev, finMessage]);

      // Simulate streaming
      await simulateStreaming(aiResponse, finMessage.id);
    } catch (error) {
      console.error("Error getting AI response:", error);

      const errorMessage = {
        id: Date.now() + 1,
        sender: "fin",
        text: "I apologize, but I encountered an error. Please try again in a moment.",
        timestamp: Date.now(),
        sources: [],
        isError: true,
      };

      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate smart sources based on query
  const generateSmartSources = (query) => {
    const q = query.toLowerCase();

    if (q.includes("refund")) {
      return [
        "Refund Policy Guidelines v2.3",
        "Processing Returns - Best Practices",
        "Customer Satisfaction Playbook",
        "60-Day Return Window FAQ",
      ];
    } else if (q.includes("account")) {
      return [
        "Account Management Guide",
        "User Onboarding Process",
        "Security Best Practices",
        "Account Recovery Procedures",
      ];
    } else if (q.includes("shipping") || q.includes("delivery")) {
      return [
        "Shipping & Logistics Manual",
        "Delivery Timeline Standards",
        "Track & Trace Guidelines",
        "Shipping Issue Resolution",
      ];
    }

    return [
      "Customer Service Guidelines",
      "Company Policy Manual",
      "Best Practices Handbook",
      "Support Team Resources",
    ];
  };

  // Generate performance metrics
  const generateMetrics = (query) => {
    return {
      confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      relevantCases: Math.floor(Math.random() * 50) + 20,
      avgResolutionTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading && !isStreaming) {
      askFinAI(query);
      setQuery("");
    }
  };

  const handleSuggestedClick = (suggestion) => {
    if (!isLoading && !isStreaming) {
      askFinAI(suggestion);
    }
  };

  const handleAddToComposer = (text) => {
    if (onAddToComposer) {
      onAddToComposer(text);
    }
  };

  const toggleExpanded = (messageId) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  // Save response for later use
  const saveResponse = (message) => {
    const newSaved = [
      ...savedResponses,
      {
        id: Date.now(),
        text: message.text,
        savedAt: new Date().toISOString(),
        category: detectCategory(message.text),
      },
    ];
    setSavedResponses(newSaved);
    localStorage.setItem("savedCopilotResponses", JSON.stringify(newSaved));
  };

  const detectCategory = (text) => {
    const t = text.toLowerCase();
    if (t.includes("refund")) return "Refunds";
    if (t.includes("account")) return "Account";
    if (t.includes("shipping")) return "Shipping";
    if (t.includes("billing")) return "Billing";
    return "General";
  };

  const deleteSavedResponse = (id) => {
    const filtered = savedResponses.filter((r) => r.id !== id);
    setSavedResponses(filtered);
    localStorage.setItem("savedCopilotResponses", JSON.stringify(filtered));
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[linear-gradient(to_top,rgba(255,223,186,0.6)_5%,rgba(218,200,255,0.6)_13%,rgba(255,255,255,0.95)_25%,white_70%)] justify-between">
      {chatHistory.length > 0 ? (
        <div className="absolute top-0 left-0 right-0 bottom-20 overflow-y-auto px-6 py-6 space-y-6">
          {chatHistory.map((message) => (
            <div key={message.id}>
              {message.sender === "user" && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                    <img
                      src="./img/char1.webp"
                      alt="You"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">You</span>
                    </div>
                    <p className="text-gray-700 text-sm">{message.text}</p>
                  </div>
                </div>
              )}

              {message.sender === "fin" && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                    <img
                      src="favicon.ico"
                      alt="Fin"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-gray-900">Fin</span>
                      {message.isStreaming && (
                        <span className="text-xs text-purple-600 animate-pulse">
                          Thinking...
                        </span>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl p-4 mb-4 ${
                        message.isWarning
                          ? "bg-yellow-100"
                          : message.isError
                          ? "bg-red-100"
                          : "bg-purple-100"
                      }`}
                    >
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                        {message.text}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1"></span>
                        )}
                      </p>

                      {/* Action buttons */}
                      {!message.isWarning &&
                        !message.isError &&
                        !message.isStreaming && (
                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={() => handleAddToComposer(message.text)}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                            >
                              <EditIcon />
                              Add to composer
                              <ChevronDownIcon />
                            </button>

                            <button
                              onClick={() => saveResponse(message)}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
                              title="Save response"
                            >
                              <SaveIcon />
                            </button>

                            <button
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
                              title="Copy to clipboard"
                              onClick={() =>
                                navigator.clipboard.writeText(message.text)
                              }
                            >
                              <CopyIcon />
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Performance Metrics */}
                    {message.metrics && !message.isStreaming && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Confidence</span>
                          <span className="font-medium text-green-600">
                            {message.metrics.confidence}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">
                            Similar cases resolved
                          </span>
                          <span className="font-medium">
                            {message.metrics.relevantCases}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            Avg resolution time
                          </span>
                          <span className="font-medium">
                            {message.metrics.avgResolutionTime} min
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sources Section */}
                    {message.sources &&
                      message.sources.length > 0 &&
                      !message.isStreaming && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-3">
                            {message.sources.length} relevant sources found
                          </p>
                          <div className="space-y-3">
                            {(expandedMessageId === message.id
                              ? message.sources
                              : message.sources.slice(0, 3)
                            ).map((source, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors py-1"
                              >
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-blue-600"
                                  >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-700 flex-1">
                                  {source}
                                </span>
                              </div>
                            ))}
                          </div>
                          {message.sources.length > 3 && (
                            <button
                              onClick={() => toggleExpanded(message.id)}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 mt-4 font-medium"
                            >
                              <span>
                                {expandedMessageId === message.id
                                  ? "Show less"
                                  : "See all"}
                              </span>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`transform transition-transform ${
                                  expandedMessageId === message.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && !isStreaming && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                <img
                  src="favicon.ico"
                  alt="Fin"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-gray-900">Fin</span>
                </div>
                <div className="bg-purple-100 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <span className="ml-2 text-gray-600 text-sm">
                      AI is analyzing the conversation...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col flex-1 items-center justify-center text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-lg mb-6">
            <img src="favicon.ico" alt="Fin" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Hi, I'm Fin AI Copilot
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Ask me anything about this conversation.
          </p>

          {/* Quick stats */}
          {/* <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">98%</div>
              <div className="text-xs text-gray-500">Accuracy</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">2.3s</div>
              <div className="text-xs text-gray-500">Avg Response</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div> */}
        </div>
      )}

      {/* Input Box - Always at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-white to-transparent pt-2">
        {/* Suggested questions - Dynamic based on context */}
        {chatHistory.length === 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedClick(question)}
                disabled={isLoading || isStreaming}
                className="bg-white border shadow rounded-xl px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {index === 0 && <strong>Suggested</strong>}
                {index === 0 ? "💸" : ""} {question}
              </button>
            ))}
          </div>
        )}

        {/* Saved responses toggle */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowSavedResponses(!showSavedResponses)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <SaveIcon className="w-3 h-3" />
            Saved responses ({savedResponses.length})
          </button>

          {chatHistory.length > 0 && (
            <button
              onClick={() => {
                setChatHistory([]);
                setExpandedMessageId(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Saved responses dropdown */}
        {showSavedResponses && savedResponses.length > 0 && (
          <div className="mb-3 max-h-40 overflow-y-auto bg-white border rounded-lg shadow-lg">
            {savedResponses.map((saved) => (
              <div
                key={saved.id}
                className="p-2 hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 truncate">
                      {saved.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {saved.category} •{" "}
                      {new Date(saved.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleAddToComposer(saved.text)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Use this response"
                    >
                      <EditIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSavedResponse(saved.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading || isStreaming}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow disabled:opacity-50"
            placeholder={
              isLoading
                ? "AI is thinking..."
                : isStreaming
                ? "AI is responding..."
                : "Ask a question..."
            }
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim() || isStreaming}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

const ArrowUpIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 19V5M12 5L5 12M12 5L19 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SaveIcon = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

export default CopilotPanel;
