import { useState, useEffect } from 'react';
import api from '../api'; 

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

 
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get('notifications/');
        setNotifications(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);


  const handleRead = async (id, isRead) => {
    if (isRead) return; 
    
    try {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      await api.patch(`notifications/${id}/`, { is_read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '6px' }}
      >
         {unreadCount > 0 && <span style={{ color: 'red', fontWeight: 'bold' }}>({unreadCount})</span>}
      </button>

      {isOpen && (
        <div style={{ 
          position: 'absolute', right: 0, top: '40px', width: '300px', 
          backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, color: 'black'
        }}>
          <h4 style={{ padding: '12px', margin: 0, borderBottom: '1px solid #eee' }}>Notifications</h4>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p style={{ padding: '12px', textAlign: 'center', color: '#666' }}>All caught up!</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleRead(notif.id, notif.is_read)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: notif.is_read ? '#fff' : '#ebf8ff',
                    cursor: 'pointer'
                  }}
                >
                  {renderNotificationContent(notif)}
                  <small style={{ color: '#888' }}>
                    {new Date(notif.created_at).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const renderNotificationContent = (notification) => {
  const { event_type, payload, actor } = notification;
  const actorName = actor ? `@${actor.username}` : 'System';

  switch (event_type) {
    case 'task_assigned':
      return <p><b>{actorName}</b> assigned you to <b>{payload.task_title}</b></p>;
    case 'stage_changed':
      return <p><b>{payload.task_title}</b> moved to <b>{payload.new_stage}</b></p>;
    case 'comment_added':
      return <p><b>{actorName}</b> commented on your task.</p>;
    case 'attachment_uploaded':
      return <p>New file uploaded to <b>{payload.task_title}</b></p>;
    default:
      return <p>New activity in your studio.</p>;
  }
};