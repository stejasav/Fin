// components/Sidebar.js
import React from 'react';

const Sidebar = ({ activeChat, setActiveChat }) => {
  const [viewMode, setViewMode] = React.useState('list'); // 'list' or 'grid'
  
  const chats = [
    { 
      id: 1, 
      name: 'Luis', 
      company: 'Github', 
      preview: 'Hey! I have a questio...', 
      time: '45m',
      avatar: 'L',
      avatarColor: 'bg-blue-500',
      unread: false
    },
    { 
      id: 2, 
      name: 'Ivan', 
      company: 'Nike', 
      preview: 'Hi there, I have a qu...', 
      time: '30m',
      avatar: 'I',
      avatarColor: 'bg-red-500',
      unread: true,
      waiting: '3min'
    },
    { 
      id: 3, 
      name: 'Lead from New York', 
      preview: 'Good morning, let me...', 
      time: '40m',
      avatar: 'L',
      avatarColor: 'bg-blue-500',
      unread: false,
      hasIndicator: true
    },
    { 
      id: 4, 
      name: 'Booking API problems', 
      preview: 'Bug report', 
      time: '45m',
      avatar: <BugIcon />,
      avatarColor: 'bg-black',
      unread: false,
      details: 'Luis · Small Crafts'
    },
    { 
      id: 5, 
      name: 'Miracle', 
      company: 'Exemplary Bank', 
      preview: "Hey there, I'm here to...", 
      time: '45m',
      avatar: <MiracleIcon />,
      avatarColor: 'bg-gray-300 text-gray-600',
      unread: false
    }
  ];

  return (
    <div className="w-80 bg-white border-r flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b h-[73px]">
        <h2 className="font-semibold text-lg text-gray-900">Your inbox</h2>
      </div>

      {/* Filter Section */}
      <div className="flex items-center px-4 py-3 gap-4 border-b text-sm bg-gray-50">
        <div className="flex items-center gap-1 text-gray-700">
          <span className="font-medium">5 Open</span>
          <ChevronDownIcon />
        </div>
        <div className="flex items-center gap-1 text-gray-700">
          <span className="font-medium">Waiting longest</span>
          <ChevronDownIcon />
        </div>
      </div>

      {/* Chat List - This will take remaining space */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "list" ? (
          // List View
          <div>
            {chats.map((chat) => {
              const chatDisplayName = chat.company
                ? `${chat.name} · ${chat.company}`
                : chat.name;
              const isActive = activeChat === chatDisplayName;

              return (
                <div
                  key={chat.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  } ${chat.unread ? "bg-yellow-50" : ""}`}
                  onClick={() => setActiveChat(chatDisplayName)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full ${chat.avatarColor} flex items-center justify-center text-sm font-medium shrink-0 mt-0.5`}
                    >
                      {chat.avatar}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {chatDisplayName}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2">
                          {chat.waiting && (
                            <div className="flex items-center bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-medium">
                              ⏰ {chat.waiting}
                            </div>
                          )}
                          {chat.hasIndicator && (
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {chat.time}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.preview}
                      </p>
                      {chat.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {chat.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-2 gap-3 p-4">
            {chats.map((chat) => {
              const chatDisplayName = chat.company
                ? `${chat.name} · ${chat.company}`
                : chat.name;
              const isActive = activeChat === chatDisplayName;

              return (
                <div
                  key={chat.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border rounded-lg relative ${
                    isActive ? "bg-blue-50 border-blue-300" : "border-gray-200"
                  } ${chat.unread ? "bg-yellow-50 border-yellow-300" : ""}`}
                  onClick={() => setActiveChat(chatDisplayName)}
                >
                  {/* Grid Item Content */}
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full ${chat.avatarColor} flex items-center justify-center text-sm font-medium mb-2`}
                    >
                      {chat.avatar}
                    </div>

                    {/* Name */}
                    <span className="font-medium text-xs text-gray-900 truncate w-full mb-1">
                      {chat.name}
                    </span>
                    {chat.company && (
                      <span className="text-xs text-gray-500 truncate w-full">
                        {chat.company}
                      </span>
                    )}

                    {/* Preview */}
                    <p className="text-xs text-gray-600 truncate w-full mt-1">
                      {chat.preview}
                    </p>

                    {/* Indicators and Time */}
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {chat.waiting && (
                        <div className="flex items-center bg-yellow-400 text-black px-1.5 py-0.5 rounded-full text-xs">
                          ⏰
                        </div>
                      )}
                      {chat.hasIndicator && (
                        <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                      )}
                      <span className="text-xs text-gray-500">{chat.time}</span>
                    </div>

                    {chat.details && (
                      <p className="text-xs text-gray-400 mt-1 truncate w-full">
                        {chat.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Controls - Exact match to photo */}
      <div className="bg-white px-4 py-4">
        <div className="flex bg-gray-100 rounded-full p-1 w-fit">
          <button
            className={`px-3 py-2 rounded-full transition-all duration-200 flex items-center justify-center ${
              viewMode === "grid"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <GridIcon />
          </button>
          <button
            className={`px-3 py-2 rounded-full transition-all duration-200 flex items-center justify-center ${
              viewMode === "list"
                ? "bg-black text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <ListIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const BugIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 2 1.88 1.88"></path>
    <path d="M14.12 3.88 16 2"></path>
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"></path>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"></path>
    <path d="M12 20v-9"></path>
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5"></path>
    <path d="M6 13H2"></path>
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4"></path>
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"></path>
    <path d="M22 13h-4"></path>
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"></path>
  </svg>
);

const MiracleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"></line>
    <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"></line>
    <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"></line>
    <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"></line>
    <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"></line>
    <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"></line>
  </svg>
);

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"></rect>
  </svg>
);

export default Sidebar;