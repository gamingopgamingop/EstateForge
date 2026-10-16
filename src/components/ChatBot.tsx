import React, { useState, useRef, useEffect } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ChatBotIcon from './ChatBotIcon';
import { generateGeminiResponse, testGeminiConnection } from '../utils/geminiApi';

// Define types for our messages
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your RentRight Assistant. I can help you find student PGs, calculate your 30% rent affordability budget, answer questions about security deposits, or schedule property viewings. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Test the Gemini API connection when the component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testGeminiConnection();
        setApiConnected(true);
        console.log('Gemini API connection successful');
      } catch (error) {
        setApiConnected(false);
        console.error('Gemini API connection failed:', error);
      }
    };
    
    checkConnection();
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      if (!apiConnected) {
        return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
      }
      
      // Call the simplified Gemini API with just the user message
      const response = await generateGeminiResponse(userMessage);
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      setApiConnected(false); // Mark as disconnected if we get an error
      return "I'm having trouble connecting to my knowledge base right now. Please try again later or ask another question about real estate.";
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    
    try {
      // Get bot response
      const responseText = await generateResponse(userMessage.text);
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && <ChatBotIcon onClick={toggleChat} />}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200 z-50">
          {apiConnected === false && (
            <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-800 px-4 py-2 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              API connection issue. Responses may be limited.
            </div>
          )}
          {/* Chat header */}
          <div className="bg-violet-600 text-white p-3 font-medium flex justify-between items-center">
            <span className="font-bold text-sm">RentRight Rental Assistant</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleChat}
              className="h-8 w-8 p-0 text-white hover:bg-purple-700 rounded-full"
            >
              <X size={18} />
            </Button>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input area */}
          <div className="border-t border-gray-200 p-3 flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || inputValue.trim() === ''}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-l-none rounded-r-lg px-3 py-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
