import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications/my');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            // silent fail on background polls
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            socket.emit('join', user._id);

            socket.on('newNotification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast.info(`🔔 ${notification.title}`, {
                    position: 'top-right',
                    autoClose: 4000,
                    theme: 'colored'
                });
            });

            // Auto-refresh every 5 seconds
            intervalRef.current = setInterval(fetchNotifications, 5000);

            return () => {
                socket.off('newNotification');
                clearInterval(intervalRef.current);
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
            clearInterval(intervalRef.current);
        }
    }, [user, fetchNotifications]);

    const markReadArea = async (id) => {
        try {
            await api.put(`/notifications/read/${id}`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Sync failure');
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            const removed = notifications.find(n => n._id === id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            if (removed && !removed.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            markReadArea, 
            markAllRead,
            deleteNotification, 
            refresh: fetchNotifications 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
