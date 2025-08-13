import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';
import { Conversation, ChatMessage } from '@/types';
import { showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatWindowProps {
  conversation: Conversation | null;
  isMobile?: boolean;
  onBack?: () => void;
}

const ChatWindow = ({ conversation, isMobile, onBack }: ChatWindowProps) => {
  const { profile, sendSupportMessage } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation || !profile?.depot_id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('depot_id', profile.depot_id)
        .eq('user_id', conversation.user_id)
        .order('created_at', { ascending: true });

      if (error) {
        showError('Falha ao carregar mensagens.');
      } else {
        setMessages(data);
      }
      setLoading(false);
    };
    if (conversation) {
      fetchMessages();
    }
  }, [conversation, profile?.depot_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversation || !profile?.depot_id) return;

    const channel = supabase.channel(`depot-chat:${profile.depot_id}:${conversation.user_id}`)
      .on<ChatMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `depot_id=eq.${profile.depot_id}`
        },
        (payload) => {
          if (payload.new.user_id === conversation.user_id) {
            setMessages(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, profile?.depot_id]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && conversation && profile?.depot_id) {
      const messageToSend = newMessage;
      setNewMessage('');
      await sendSupportMessage(messageToSend, profile.depot_id, conversation.user_id);
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MessageSquare className="w-16 h-16 mb-4" />
        <p>Selecione uma conversa para começar</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h3 className="font-semibold text-lg">{conversation.full_name}</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-3/4 ml-auto" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender === 'support' 
                    ? 'bg-red-600 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua resposta..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;