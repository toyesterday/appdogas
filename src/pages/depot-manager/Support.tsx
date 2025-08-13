import { useState } from 'react';
import ConversationList from '@/components/depot-manager/ConversationList';
import ChatWindow from '@/components/depot-manager/ChatWindow';
import { Conversation } from '@/types';

const DepotManagerSupport = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <div className="flex h-[calc(100vh-8rem)] border bg-white rounded-lg shadow-sm">
      <div className="w-full md:w-1/3 border-r">
        <ConversationList 
          onSelectConversation={setSelectedConversation} 
          selectedConversation={selectedConversation} 
        />
      </div>
      <div className="hidden md:flex w-2/3 flex-col">
        <ChatWindow conversation={selectedConversation} />
      </div>
    </div>
  );
};

export default DepotManagerSupport;