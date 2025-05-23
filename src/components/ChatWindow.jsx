import EmojiPicker from "emoji-picker-react";
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

const ChatWindow = forwardRef(
  ({ activeChat, inputMode, setInputMode, messages, setMessages }, ref) => {
    const [messageInput, setMessageInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showInputModeDropdown, setShowInputModeDropdown] = useState(false);

    // Rich text functionality - hidden from UI
    const editorRef = useRef(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontSizes, setShowFontSizes] = useState(false);

    // Expose method to parent component to set editor content
    useImperativeHandle(ref, () => ({
      setEditorContent: (content) => {
        if (editorRef.current) {
          // Convert plain text to HTML with line breaks
          const htmlContent = content
            .split("\n")
            .map((line) => line || "<br>")
            .join("<br>");

          editorRef.current.innerHTML = htmlContent;
          setMessageInput(content);

          // Focus the editor
          editorRef.current.focus();

          // Move cursor to end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      },
    }));

    // Predefined options for rich text
    const textColors = [
      "#000000",
      "#374151",
      "#6B7280",
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#F97316",
    ];

    const highlightColors = [
      "transparent",
      "#FEF3C7",
      "#DBEAFE",
      "#D1FAE5",
      "#FCE7F3",
      "#E0E7FF",
      "#F3E8FF",
      "#FED7D7",
      "#D1F2EB",
      "#E6FFFA",
    ];

    const fontSizes = [
      { label: "Small", value: "12px" },
      { label: "Normal", value: "14px" },
      { label: "Medium", value: "16px" },
      { label: "Large", value: "18px" },
      { label: "X-Large", value: "24px" },
    ];

    // Scroll to bottom when messages change
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleEmojiClick = (emojiData) => {
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand("insertText", false, emojiData.emoji);
        setMessageInput(editorRef.current.innerText || "");
      } else {
        setMessageInput((prev) => prev + emojiData.emoji);
      }
      setShowEmojiPicker(false);
    };

    // Handle text selection for rich text toolbar
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount || selection.isCollapsed) {
        setShowToolbar(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText.length > 0) {
        const rect = range.getBoundingClientRect();

        setToolbarPosition({
          top: rect.top - 60,
          left: Math.max(10, rect.left + rect.width / 2 - 150),
        });
        setShowToolbar(true);
      }
    };

    // Apply rich text formatting
    const applyFormatting = (type, value = null) => {
      if (!editorRef.current) return;

      editorRef.current.focus();

      switch (type) {
        case "bold":
          document.execCommand("bold", false, null);
          break;
        case "italic":
          document.execCommand("italic", false, null);
          break;
        case "underline":
          document.execCommand("underline", false, null);
          break;
        case "strikethrough":
          document.execCommand("strikeThrough", false, null);
          break;
        case "code":
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            if (selectedText) {
              const codeElement = document.createElement("code");
              Object.assign(codeElement.style, {
                backgroundColor: "#f1f5f9",
                color: "#1e293b",
                padding: "2px 6px",
                borderRadius: "4px",
                fontFamily: "Monaco, Consolas, monospace",
                fontSize: "13px",
              });
              codeElement.textContent = selectedText;
              range.deleteContents();
              range.insertNode(codeElement);
              selection.removeAllRanges();
            }
          }
          break;
        case "link":
          const url = prompt("Enter URL:");
          if (url && url.trim()) {
            document.execCommand("createLink", false, url);
          }
          break;
        case "textColor":
          document.execCommand("foreColor", false, value);
          break;
        case "backgroundColor":
          document.execCommand("backColor", false, value);
          break;
        case "fontSize":
          document.execCommand("fontSize", false, "4");
          const fontElements =
            editorRef.current.querySelectorAll('font[size="4"]');
          fontElements.forEach((el) => {
            el.style.fontSize = value;
            el.removeAttribute("size");
          });
          break;
        case "h1":
          document.execCommand("formatBlock", false, "h1");
          break;
        case "h2":
          document.execCommand("formatBlock", false, "h2");
          break;
        case "clear":
          document.execCommand("removeFormat", false, null);
          break;
        default:
          break;
      }

      setShowToolbar(false);
      setShowColorPicker(false);
      setShowFontSizes(false);
      setMessageInput(editorRef.current.innerText || "");
    };

    // Hide toolbar when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          !event.target.closest(".formatting-toolbar") &&
          !event.target.closest(".input-mode-dropdown")
        ) {
          setShowToolbar(false);
          setShowColorPicker(false);
          setShowFontSizes(false);
          setShowInputModeDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Function to format timestamp
    const formatTimestamp = (timestamp) => {
      const diff = Date.now() - timestamp;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    };

    // Function to send a message or add a note
    const sendMessage = () => {
      const textToSend = editorRef.current
        ? editorRef.current.innerText?.trim()
        : messageInput.trim();
      const htmlContent = editorRef.current
        ? editorRef.current.innerHTML
        : messageInput;

      if (!textToSend) return;

      if (inputMode === "note") {
        // Handle note creation - same as chat but maybe with different styling
        setIsTyping(true);

        setTimeout(() => {
          const newMessage = {
            id: Date.now(),
            sender: "agent",
            text: textToSend,
            html: htmlContent,
            timestamp: Date.now(),
            isNote: true, // Optional: flag to identify notes for different styling
          };

          setMessages([...messages, newMessage]);

          if (editorRef.current) {
            editorRef.current.innerHTML = "";
          }
          setMessageInput("");
          setIsTyping(false);
        }, 500);
        return;
      }

      // Show typing indicator for chat messages
      setIsTyping(true);

      // Delay adding the message to simulate sending
      setTimeout(() => {
        // Add the new agent message
        const newMessage = {
          id: Date.now(),
          sender: "agent",
          text: textToSend,
          html: htmlContent,
          timestamp: Date.now(),
        };

        setMessages([...messages, newMessage]);

        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
        setMessageInput("");
        setIsTyping(false);
      }, 500);
    };

    // Handle Enter key press
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    // Keyboard shortcuts
    useEffect(() => {
      const handleShortcut = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          // Open macros or shortcuts here
        }

        // Rich text shortcuts
        if ((e.metaKey || e.ctrlKey) && e.key === "b") {
          e.preventDefault();
          applyFormatting("bold");
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "i") {
          e.preventDefault();
          applyFormatting("italic");
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "u") {
          e.preventDefault();
          applyFormatting("underline");
        }
      };

      window.addEventListener("keydown", handleShortcut);
      return () => window.removeEventListener("keydown", handleShortcut);
    }, []);

    const username = activeChat.split(" · ")[0];
    const userInitial = username.charAt(0).toUpperCase();

    return (
      <div className="flex-1 flex flex-col bg-white h-full">
        {/* Rich Text Formatting Toolbar - Only shows when text is selected */}
        {showToolbar && (
          <div
            className="formatting-toolbar fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              minWidth: "300px",
            }}
          >
            <button
              onClick={() => applyFormatting("bold")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors font-bold text-sm"
              title="Bold (Ctrl+B)"
            >
              B
            </button>
            <button
              onClick={() => applyFormatting("italic")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors italic text-sm"
              title="Italic (Ctrl+I)"
            >
              I
            </button>
            <button
              onClick={() => applyFormatting("underline")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors underline text-sm"
              title="Underline (Ctrl+U)"
            >
              U
            </button>
            <button
              onClick={() => applyFormatting("strikethrough")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors line-through text-sm"
              title="Strikethrough"
            >
              S
            </button>
            <button
              onClick={() => applyFormatting("code")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors font-mono text-sm bg-gray-50"
              title="Code"
            >
              &lt;/&gt;
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-sm"
                title="Text Color"
              >
                🎨
              </button>
              {showColorPicker && (
                <div className="absolute top-8 left-0 bg-white border rounded-lg shadow-lg p-2 z-60">
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Text
                    </p>
                    <div className="flex gap-1">
                      {textColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => applyFormatting("textColor", color)}
                          className="w-4 h-4 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Highlight
                    </p>
                    <div className="flex gap-1">
                      {highlightColors.map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            applyFormatting("backgroundColor", color)
                          }
                          className="w-4 h-4 rounded border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Font Size */}
            <div className="relative">
              <button
                onClick={() => setShowFontSizes(!showFontSizes)}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors text-sm"
                title="Font Size"
              >
                Aa
              </button>
              {showFontSizes && (
                <div className="absolute top-8 left-0 bg-white border rounded-lg shadow-lg p-1 z-60 min-w-20">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => applyFormatting("fontSize", size.value)}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-xs"
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            <button
              onClick={() => applyFormatting("h1")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors font-bold text-sm"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => applyFormatting("h2")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors font-bold text-xs"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => applyFormatting("link")}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-sm"
              title="Link"
            >
              🔗
            </button>
            <button
              onClick={() => applyFormatting("clear")}
              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors text-sm"
              title="Clear Formatting"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat Header - Matching height with other panels */}
        <div className="px-4 py-4 border-b flex items-center justify-between bg-white h-[73px]">
          <h2 className="font-semibold text-lg text-gray-900">{username}</h2>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-gray-800 transition bg-gray-100 rounded-md">
              <DotsIcon />
            </button>
            <button className="p-2 text-black hover:text-gray-800 transition bg-gray-100 rounded-md">
              <MoonIcon />
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition text-sm font-medium flex items-center gap-2">
              <CloseButtonIcon />
              Close
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id}>
              {message.sender === "user" && (
                <div className="flex items-end gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium shrink-0">
                    {userInitial}
                  </div>
                  <div className="max-w-2xl">
                    <div className="p-4 rounded-2xl bg-gray-200 text-gray-900">
                      {message.html ? (
                        <div
                          className="leading-relaxed mb-2"
                          dangerouslySetInnerHTML={{ __html: message.html }}
                        />
                      ) : (
                        <p className="leading-relaxed mb-2">{message.text}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        <span>{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {message.sender === "agent" && (
                <div className="flex items-end gap-3 justify-end">
                  <div className="max-w-2xl">
                    <div
                      className={`p-4 rounded-2xl ${
                        message.isNote
                          ? "bg-yellow-100 text-yellow-900"
                          : "bg-blue-100 text-blue-900"
                      }`}
                    >
                      {message.html ? (
                        <div
                          className="leading-relaxed mb-2"
                          dangerouslySetInnerHTML={{ __html: message.html }}
                        />
                      ) : (
                        <p className="leading-relaxed mb-2">{message.text}</p>
                      )}
                      <div
                        className={`flex items-center justify-end gap-2 text-xs ${
                          message.isNote ? "text-yellow-700" : "text-blue-700"
                        }`}
                      >
                        {message.seen && <span>Seen</span>}
                        <span>·</span>
                        <span>{formatTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img
                      src="./img/char1.webp"
                      alt="Agent avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src="./img/char1.webp"
                  alt="Agent avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-gray-200 text-gray-500 py-2 px-4 rounded-full text-sm">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input with Chat/Note toggle */}
        <div className="px-4 pb-6">
          <div
            className={`rounded-xl border shadow-[0_1px_4px_rgba(0,0,0,0.06)] px-4 py-3 space-y-3 ${
              inputMode === "note"
                ? "bg-yellow-100 border-yellow-200"
                : "bg-white"
            }`}
          >
            {/* Input Mode Header with dropdown */}
            <div className="flex justify-between items-center">
              <div className="relative">
                <button
                  onClick={() =>
                    setShowInputModeDropdown(!showInputModeDropdown)
                  }
                  className="flex items-center gap-2 text-sm font-medium text-black rounded-md px-2 py-1 transition-colors"
                >
                  {inputMode === "chat" ? <ChatIcon /> : <NoteIcon />}
                  <span className="capitalize">{inputMode}</span>
                  <ChevronDownIcon />
                </button>

                {/* Dropdown menu */}
                {showInputModeDropdown && (
                  <div className="input-mode-dropdown absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-32">
                    <button
                      onClick={() => {
                        setInputMode("chat");
                        setShowInputModeDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        inputMode === "chat"
                          ? "bg-gray-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <ChatIcon />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        setInputMode("note");
                        setShowInputModeDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        inputMode === "note"
                          ? "bg-gray-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      <NoteIcon />
                      <span>Note</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">
                Use ⌘K for shortcuts
              </span>
            </div>

            {/* Message writing area */}
            <div className="relative">
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setMessageInput(e.target.innerText || "")}
                onKeyDown={handleKeyDown}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                className="w-full resize-none outline-none text-sm text-gray-800 placeholder-gray-400 min-h-[72px] p-0"
                style={{
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
                data-placeholder={
                  inputMode === "chat"
                    ? "Type a message..."
                    : "Type your note..."
                }
              />
            </div>

            {/* Icons + Send/Add Note Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-black">
                <button className="hover:text-blue-600">
                  <LightningIcon />
                </button>

                <div className="h-4 border-l border-gray-300" />

                <button className="hover:text-blue-600">
                  <SaveIcon />
                </button>
                <div className="relative mt-[6px]">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="hover:text-blue-600"
                  >
                    <EmojiIcon />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-10 left-0 z-50">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        theme="light"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className={`flex items-center text-sm font-medium rounded-lg transition-all
                ${
                  messageInput.trim()
                    ? "bg-black text-white"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {messageInput.trim() ? (
                  <>
                    <span className="px-3 py-1.5">
                      {inputMode === "chat" ? "Send" : "Add note"}
                    </span>
                    <div className="h-5 w-px bg-white/30" />
                    <span className="px-2 py-1.5">
                      <ChevronDownIcon className="h-4 w-4 text-white" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1.5">
                      {inputMode === "chat" ? "Send" : "Add note"}
                    </span>
                    <div className="h-5 w-px bg-transparent" />
                    <span className="px-2 py-1.5">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CSS for rich text styling */}
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: normal;
            pointer-events: none;
          }

          [contenteditable] h1 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.2em 0;
          }

          [contenteditable] h2 {
            font-size: 1.3em;
            font-weight: bold;
            margin: 0.2em 0;
          }

          [contenteditable] blockquote {
            border-left: 3px solid #3b82f6;
            padding-left: 0.5em;
            margin: 0.2em 0;
            font-style: italic;
            color: #6b7280;
          }

          [contenteditable] ul,
          [contenteditable] ol {
            padding-left: 1.2em;
            margin: 0.2em 0;
          }

          [contenteditable] a {
            color: #3b82f6;
            text-decoration: underline;
          }

          [contenteditable]:focus {
            outline: none;
          }
        `}</style>
      </div>
    );
  }
);

// All the original icons plus the new NoteIcon
const DotsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#000"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#000"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const CloseButtonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="9" x2="15" y2="15"></line>
    <line x1="15" y1="9" x2="9" y2="15"></line>
  </svg>
);

const LightningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="#000"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
);

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17,21 17,13 7,13 7,21"></polyline>
    <polyline points="7,3 7,8 15,8"></polyline>
  </svg>
);

const EmojiIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const NoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10,9 9,9 8,9"></polyline>
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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

ChatWindow.displayName = "ChatWindow";

export default ChatWindow;
