import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversation } from '@/types';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

const ConversationList = ({ onSelectConversation, selectedConversation }: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_depot_conversations');
      if (error) {
        showError('Falha ao carregar conversas.');
        console.error(error);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="p-2 space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3 border-b">
        <h2 className="text-lg font-semibold">Conversas</h2>
      </div>
      <div className="p-2 space-y-1">
        {conversations.length === 0 ? (
          <p className="p-4 text-center text-gray-500">Nenhuma conversa iniciada.</p>
        ) : (
          conversations.map(convo => (
            <button
              key={convo.user_id}
              onClick={() => onSelectConversation(convo)}
              className={cn(
                "w-full text-left p-3 rounded-lg hover:bg-gray-100",
                selectedConversation?.user_id === convo.user_id && "bg-red-50"
              )}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">{convo.full_name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <p className="text-sm text-gray-600 truncate">{convo.last_message}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;