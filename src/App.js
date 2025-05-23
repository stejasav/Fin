// App.js
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import CopilotPanel from "./components/CopilotPanel";
import DetailsPanel from "./components/DetailsPanel";
import "./index.css";

function App() {
  const [activeChat, setActiveChat] = useState("Luis · Github");
  const [inputModes, setInputModes] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState("chat");
  const [isCopilotVisible, setIsCopilotVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("ai_copilot");
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMessages, setUserMessages] = useState({
    "Luis · Github": [
      {
        id: 1,
        sender: "user",
        text: "I bought a product from your store in November as a Christmas gift for a member of my family. However, it turns out they have something very similar already. I was hoping you'd be able to refund me, as it is un-opened.",
        timestamp: Date.now() - 60000,
      },
      {
        id: 2,
        sender: "agent",
        text: "Let me just look into this for you, Luis.",
        timestamp: Date.now() - 45000,
        seen: true,
      },
    ],
    "Ivan · Nike": [
      {
        id: 1,
        sender: "user",
        text: "Hi there, I have a question about my recent order. The shoes I received are a different color than what I ordered.",
        timestamp: Date.now() - 30000,
      },
      {
        id: 2,
        sender: "agent",
        text: "I'm sorry to hear about that, Ivan. Let me check your order details and we'll get this sorted out for you right away.",
        timestamp: Date.now() - 25000,
        seen: true,
      },
    ],
    "Lead from New York": [
      {
        id: 1,
        sender: "user",
        text: "Good morning, let me know if you have any enterprise packages available for our company.",
        timestamp: Date.now() - 40000,
      },
      {
        id: 2,
        sender: "agent",
        text: "Good morning! Yes, we do have several enterprise solutions. I'd be happy to discuss the options that would work best for your company size and needs.",
        timestamp: Date.now() - 35000,
        seen: true,
      },
    ],
    "Miracle · Exemplary Bank": [
      {
        id: 1,
        sender: "user",
        text: "Hey there, I'm here to discuss integrating your payment solution with our banking platform. We're looking for a secure and compliant API.",
        timestamp: Date.now() - 50000,
      },
      {
        id: 2,
        sender: "agent",
        text: "Hello Miracle! That sounds like an exciting opportunity. Our payment API is fully PCI compliant and designed specifically for financial institutions. Let me connect you with our enterprise integration specialist.",
        timestamp: Date.now() - 45000,
        seen: true,
      },
    ],
  });

  // Create a ref to access ChatWindow methods
  const chatWindowRef = useRef(null);

  const commandItems = [
    {
      id: "write-note",
      icon: "✏️",
      title: "Write a note",
      shortcut: "N",
      action: () => {
        setInputModes((prev) => ({
          ...prev,
          [activeChat]: "note",
        }));
        console.log("Write a note");
      },
    },
    {
      id: "use-macro",
      icon: "🏷️",
      title: "Use macro",
      shortcut: "\\",
      action: () => console.log("Use macro"),
    },
    {
      id: "summarize",
      icon: "😊",
      title: "Summarize conversation",
      shortcut: "S",
      action: () => console.log("Summarize conversation"),
    },
    {
      id: "create-ticket",
      icon: "🎫",
      title: "Create a back-office ticket",
      shortcut: "⌘ ⇧ Y",
      action: () => console.log("Create ticket"),
    },
    {
      id: "snooze",
      icon: "🌙",
      title: "Snooze",
      shortcut: "Z",
      action: () => console.log("Snooze"),
    },
    {
      id: "upload-attachment",
      icon: "📎",
      title: "Upload attachment",
      shortcut: "⌘ ⇧ A",
      action: () => console.log("Upload attachment"),
    },
    {
      id: "insert-gif",
      icon: "📶",
      title: "Insert gif",
      shortcut: "⌘ ⇧ G",
      action: () => console.log("Insert gif"),
    },
  ];

  // Filter command items based on search query
  const filteredItems = commandItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Command+K shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle the modal - if open, close it; if closed, open it
        setShowCommandMenu((prev) => !prev);
        if (!showCommandMenu) {
          setSearchQuery("");
        }
      }

      // Close modal on Escape
      if (e.key === "Escape") {
        setShowCommandMenu(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCommandMenu]);

  // Handle command item click
  const handleCommandClick = (item) => {
    item.action();
    setShowCommandMenu(false);
    setSearchQuery("");
  };

  // Function to toggle copilot panel
  const toggleCopilot = () => {
    setIsCopilotVisible(!isCopilotVisible);
  };

  // Handler for adding AI response to composer
  const handleAddToComposer = (text) => {
    if (chatWindowRef.current && chatWindowRef.current.setEditorContent) {
      chatWindowRef.current.setEditorContent(text);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Command+K Modal - Exact styling from image */}
      {showCommandMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-200">
            {/* Search Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actions"
                className="w-full text-lg text-gray-600 placeholder-gray-400 outline-none bg-transparent"
                autoFocus
              />
            </div>

            {/* Command List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleCommandClick(item)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-700 font-normal text-base">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 font-medium">
                    {item.shortcut}
                  </span>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-500">
                  No actions found
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-6">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                  ↓
                </kbd>
                <span className="ml-1">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                  ↵
                </kbd>
                <span className="ml-1">to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                  Esc
                </kbd>
                <span className="ml-1">to close</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b p-2 flex justify-between items-center z-10">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-sm rounded ${
                activeView === "sidebar" ? "bg-blue-100 text-blue-600" : ""
              }`}
              onClick={() => setActiveView("sidebar")}
            >
              Inbox
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                activeView === "chat" ? "bg-blue-100 text-blue-600" : ""
              }`}
              onClick={() => setActiveView("chat")}
            >
              Chat
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${
                activeView === "copilot" ? "bg-blue-100 text-blue-600" : ""
              }`}
              onClick={() => setActiveView("copilot")}
            >
              AI Copilot
            </button>
          </div>
        </div>
      )}

      <div className={`flex flex-1 overflow-hidden ${isMobile ? "pt-10" : ""}`}>
        {/* Sidebar */}
        <div
          className={`${
            isMobile ? (activeView === "sidebar" ? "block" : "hidden") : "block"
          }`}
        >
          <Sidebar
            activeChat={activeChat}
            setActiveChat={(chat) => {
              setActiveChat(chat);
              if (isMobile) setActiveView("chat");
            }}
          />
        </div>

        {/* Chat Window */}
        <div
          className={`flex-1 ${
            isMobile ? (activeView === "chat" ? "flex" : "hidden") : "flex"
          }`}
        >
          <ChatWindow
            ref={chatWindowRef}
            activeChat={activeChat}
            inputMode={inputModes[activeChat] || "chat"}
            setInputMode={(mode) =>
              setInputModes((prev) => ({
                ...prev,
                [activeChat]: mode,
              }))
            }
            messages={userMessages[activeChat] || []}
            setMessages={(messages) =>
              setUserMessages((prev) => ({
                ...prev,
                [activeChat]: messages,
              }))
            }
          />
        </div>

        {/* Copilot Panel and Details */}
        {(isMobile ? activeView === "copilot" : isCopilotVisible) && (
          <div className="flex flex-col border-l w-[500px]">
            {/* Tabs - Matching header height */}
            <div className="flex items-center border-b bg-white px-4 py-4 h-[73px]">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <button
                    className={`p-1 rounded text-sm flex items-center gap-1 ${
                      activeTab === "ai_copilot"
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("ai_copilot")}
                  >
                    {" "}
                    AI Copilot{" "}
                  </button>
                  <span className="mx-2 text-gray-300">|</span>
                  <button
                    className={`p-1 rounded text-sm flex items-center gap-1 ${
                      activeTab === "details"
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    {" "}
                    Details{" "}
                  </button>
                </div>
                <div
                  className={`h-0.5 bg-blue-600 mt-1.5 transition-all ${
                    activeTab === "ai_copilot" ? "w-16 ml-0" : "w-10 ml-24"
                  }`}
                ></div>
              </div>

              <button
                className="ml-auto p-1.5 bg-transparent text-gray-500 hover:bg-gray-100 rounded"
                onClick={toggleCopilot}
              >
                <LayoutIcon />
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
              {activeTab === "ai_copilot" && (
                <CopilotPanel
                  activeChat={activeChat}
                  messages={userMessages[activeChat] || []}
                  onAddToComposer={handleAddToComposer}
                />
              )}
              {activeTab === "details" && <DetailsPanel />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility icon component
const LayoutIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
    <line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export default App;
