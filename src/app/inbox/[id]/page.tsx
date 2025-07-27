'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for a conversation
const mockConversation = {
  id: '1',
  username: 'sarah_j',
  avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
  messages: [
    {
      id: 1,
      sender: 'sarah_j',
      text: 'Hey, loved your latest video! 🔥',
      timestamp: '2:30 PM',
      isMe: false,
    },
    {
      id: 2,
      sender: 'me',
      text: 'Thanks! I worked really hard on it.',
      timestamp: '2:32 PM',
      isMe: true,
    },
    {
      id: 3,
      sender: 'sarah_j',
      text: 'The editing was so smooth. What app do you use?',
      timestamp: '2:33 PM',
      isMe: false,
    },
    {
      id: 4,
      sender: 'me',
      text: 'I use CapCut for most of my videos. It\'s pretty easy to use!',
      timestamp: '2:35 PM',
      isMe: true,
    },
    {
      id: 5,
      sender: 'sarah_j',
      text: 'Cool! I\'ll check it out. Would love to collaborate sometime.',
      timestamp: '2:36 PM',
      isMe: false,
    },
  ],
};


export default function ChatPage({ params }: any) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockConversation.messages);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen pb-16">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <Link href="/inbox" className="mr-4">
          <ArrowLeftIcon className="h-6 w-6 text-gray-500" />
        </Link>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
            <Image 
              src={mockConversation.avatar} 
              alt={mockConversation.username}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">@{mockConversation.username}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
          >
            {!message.isMe && (
              <div className="h-8 w-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <Image 
                  src={mockConversation.avatar} 
                  alt={mockConversation.username}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            )}
            <div 
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.isMe 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-gray-200 text-gray-900 rounded-tl-none'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${message.isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="ml-2 bg-indigo-600 text-white rounded-full p-2"
            onClick={handleSendMessage}
          >
            <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}