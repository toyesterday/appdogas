import { useState } from 'react';
import ConversationList from '@/components/depot-manager/ConversationList';
import ChatWindow from '@/components/depot-manager/ChatWindow';
import { Conversation } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

const DepotManagerSupport = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-6rem)] bg-white rounded-lg shadow-sm overflow-hidden">
        {selectedConversation ? (
          <ChatWindow 
            conversation={selectedConversation} 
            isMobile={true}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <ConversationList 
            onSelectConversation={setSelectedConversation} 
            selectedConversation={selectedConversation} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] border bg-white rounded-lg shadow-sm">
      <div className="w-full md:w-1/3 border-r">
        <ConversationList 
          onSelectConversation={setSelectedConversation} 
          selectedConversation={selectedConversation} 
        />
      </div>
      <div className="w-2/3 flex-col hidden md:flex">
        <ChatWindow conversation={selectedConversation} />
      </div>
    </div>
  );
};

export default DepotManagerSupport;