import { Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const NotificationsPage = () => {
  const { notifications, markNotificationAsRead } = useApp();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma notificação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-red-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{notification.message}</p>
                {!notification.read && (
                  <div className="mt-3">
                    <Button 
                      variant="link"
                      className="p-0 h-auto text-red-600"
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      Marcar como lida
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;