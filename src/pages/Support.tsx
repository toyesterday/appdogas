import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useDepot } from '@/context/DepotContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const SupportPage = () => {
  const { chatMessages, sendMessage, fetchChatMessages } = useApp();
  const { depot } = useDepot();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (depot.id) {
      fetchChatMessages(depot.id);
    }
  }, [depot.id, fetchChatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isSending) {
      setIsSending(true);
      const messageToSend = newMessage;
      setNewMessage('');
      await sendMessage(messageToSend, depot.id);
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white border rounded-lg">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-red-600 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}>
                <p>{msg.message}</p>
                <p className="text-xs opacity-75 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString().slice(0, 5)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending}
          />
          <Button onClick={handleSendMessage} size="icon" disabled={isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;