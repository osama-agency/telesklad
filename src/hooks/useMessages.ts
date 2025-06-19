import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  text: string | null;
  tg_id: string | null;
  created_at: string;
  updated_at: string;
  is_incoming: boolean;
  tg_msg_id: string | null;
  data: any;
}

export interface User {
  tg_id: string | null;
  messageCount: number;
  lastMessageAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useMessages(tg_id?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchMessages = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });
      
      if (tg_id) {
        params.append('tg_id', tg_id);
      }

      const response = await fetch(`/api/messages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data: MessagesResponse = await response.json();
      setMessages(data.messages);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [tg_id]);

  const sendMessage = useCallback(async (text: string, targetTgId?: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tg_id: targetTgId || tg_id,
          is_incoming: false, // исходящее сообщение
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const newMessage: Message = await response.json();
      
      // Обновляем список сообщений если показываем текущего пользователя
      if (!tg_id || tg_id === targetTgId || tg_id === newMessage.tg_id) {
        setMessages(prev => [...prev, newMessage]); // Добавляем в конец массива
      }
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [tg_id]);

  const refreshMessages = useCallback(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages(1);
  }, [fetchMessages]);

  return {
    messages,
    users,
    loading,
    error,
    pagination,
    sendMessage,
    refreshMessages,
    fetchMessages,
  };
} 