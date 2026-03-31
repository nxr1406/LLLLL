import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Heart, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export default function Layout() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Request notification permissions and register for Push Notifications
  useEffect(() => {
    const requestPermissions = async () => {
      // Web Notification API
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Capacitor Local Notifications
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {
        // Might fail on web, ignore
      }

      // Capacitor Push Notifications (For APK)
      if (Capacitor.isNativePlatform() && currentUser) {
        try {
          let permStatus = await PushNotifications.checkPermissions();

          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }

          if (permStatus.receive !== 'granted') {
            console.log('User denied push permission');
            return;
          }

          await PushNotifications.register();
        } catch (e) {
          console.error("Push Notifications error:", e);
        }
      }
    };
    
    requestPermissions();

    // Push Notification Listeners (For APK)
    if (Capacitor.isNativePlatform() && currentUser) {
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Save FCM token to user's Firestore document
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            fcmToken: token.value
          });
        } catch (e) {
          console.error("Error saving FCM token:", e);
        }
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        // You can add navigation logic here based on notification payload
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [currentUser]);

  const sendBackgroundNotification = async (title: string, body: string) => {
    if (document.visibilityState === 'hidden') {
      // Web Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      // Capacitor Native Notification
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: new Date().getTime(),
              schedule: { at: new Date(Date.now() + 100) },
            }
          ]
        });
      } catch (e) {
        // Ignore web errors for Capacitor
      }
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          const chatId = change.doc.id;
          
          // Check if there's a new message and I'm not the sender
          if (data.lastMessageSenderId && data.lastMessageSenderId !== currentUser.uid) {
            // Check if I'm currently in this chat
            const inChat = location.pathname === `/chat/${chatId}`;
            
            // We only want to notify if the unread count for me is > 0
            if (!inChat && data.unreadCount?.[currentUser.uid] > 0) {
              try {
                // Fetch sender info
                const senderSnap = await getDoc(doc(db, 'users', data.lastMessageSenderId));
                const senderData = senderSnap.exists() ? senderSnap.data() : null;
                
                // Send background notification
                sendBackgroundNotification(
                  senderData?.fullName || 'New Message',
                  data.lastMessage || 'Sent a message'
                );
                
                toast.custom((t) => (
                  <div 
                    onClick={() => {
                      toast.dismiss(t);
                      navigate(`/chat/${chatId}`);
                    }}
                    className="flex items-center w-full bg-white border border-[#DBDBDB] rounded-xl shadow-lg p-3 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#DBDBDB] overflow-hidden shrink-0 mr-3">
                      {senderData?.avatarUrl ? (
                        <img src={senderData.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-[16px] font-semibold">
                          {senderData?.fullName?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[14px] font-semibold text-[#262626] truncate">{senderData?.fullName}</span>
                      <span className="text-[13px] text-[#262626] truncate">{data.lastMessage}</span>
                    </div>
                    <span className="text-[12px] text-[#8E8E8E] ml-2 shrink-0">Now</span>
                  </div>
                ), { duration: 4000, id: `msg-${chatId}-${data.lastMessageTime?.toMillis()}` });
              } catch (e) {
                console.error("Error fetching sender info for toast:", e);
              }
            }
          }
        }
      });
    }, (error) => {
      console.error("Layout onSnapshot error:", error);
    });

    return unsubscribe;
  }, [currentUser, location.pathname, navigate]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadNotifications(snapshot.docs.length);
      
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Don't show toast if we're already on the notifications page
          if (location.pathname === '/app/notifications') return;
          
          // Only show toast for recent notifications (created within last 5 seconds)
          // This prevents showing toasts for old unread notifications on initial load
          const isRecent = !data.createdAt || (Date.now() - data.createdAt.toMillis()) < 5000;
          
          if (isRecent) {
            try {
              let fromUser = null;
              if (data.fromUserId) {
                const userSnap = await getDoc(doc(db, 'users', data.fromUserId));
                if (userSnap.exists()) {
                  fromUser = userSnap.data();
                }
              }
              
              let message = '';
              if (data.type === 'follow') message = 'started following you.';
              else if (data.type === 'reaction') message = `reacted to your message: ${data.emoji}`;
              
              // Send background notification
              sendBackgroundNotification(
                'New Notification',
                `${fromUser?.username || 'Someone'} ${message}`
              );
              
              toast.custom((t) => (
                <div 
                  onClick={() => {
                    toast.dismiss(t);
                    navigate('/app/notifications');
                  }}
                  className="flex items-center w-full bg-white border border-[#DBDBDB] rounded-xl shadow-lg p-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#DBDBDB] overflow-hidden shrink-0 mr-3">
                    {fromUser?.avatarUrl ? (
                      <img src={fromUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-[16px] font-semibold">
                        {fromUser?.fullName?.[0]?.toUpperCase() || 'S'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[14px] font-semibold text-[#262626] truncate">{fromUser?.username || 'Someone'}</span>
                    <span className="text-[13px] text-[#262626] truncate">{message}</span>
                  </div>
                </div>
              ), { duration: 4000, id: `notif-${change.doc.id}` });
            } catch (e) {
              console.error("Error fetching notification info for toast:", e);
            }
          }
        }
      });
    }, (error) => {
      console.error("Layout notifications onSnapshot error:", error);
    });

    return unsubscribe;
  }, [currentUser, location.pathname, navigate]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      
      <nav className="flex items-center justify-around h-12 border-t border-[#DBDBDB] bg-white shrink-0">
        <NavLink to="/app" end className={({ isActive }) => clsx("p-2", isActive ? "text-[#262626]" : "text-[#8E8E8E]")}>
          {({ isActive }) => <MessageCircle size={24} strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? "#262626" : "none"} />}
        </NavLink>
        <NavLink to="/app/search" className={({ isActive }) => clsx("p-2", isActive ? "text-[#262626]" : "text-[#8E8E8E]")}>
          {({ isActive }) => <Search size={24} strokeWidth={isActive ? 2.5 : 1.5} />}
        </NavLink>
        <NavLink to="/app/notifications" className={({ isActive }) => clsx("p-2 relative", isActive ? "text-[#262626]" : "text-[#8E8E8E]")}>
          {({ isActive }) => (
            <>
              <Heart size={24} strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? "#262626" : "none"} />
              {unreadNotifications > 0 && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#ED4956] rounded-full border border-white"></div>
              )}
            </>
          )}
        </NavLink>
        <NavLink to="/app/profile" className={({ isActive }) => clsx("p-2", isActive ? "text-[#262626]" : "text-[#8E8E8E]")}>
          {({ isActive }) => <User size={24} strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? "#262626" : "none"} />}
        </NavLink>
      </nav>
    </div>
  );
}
