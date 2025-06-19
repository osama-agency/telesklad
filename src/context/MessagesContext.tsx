import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export interface Message {
  id: string;
  text: string | null;
  tg_id: string | null;
  created_at: string;
  updated_at: string;
  is_incoming: boolean;
  tg_msg_id: string | null;
  data: any;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
}

export interface User {
  tg_id: string | null;
  messageCount: number;
  lastMessageAt: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  isOnline?: boolean;
  isTyping?: boolean;
  orderStats: {
    totalOrders: number;
    deliveredOrders: number;
    totalSpent: string;
    hasOrders: boolean;
    clientStatus: 'new' | 'potential' | 'active';
  };
}

interface MessagesState {
  messages: Record<string, Message[]>; // Группировка по tg_id
  users: User[];
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

type MessagesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_MESSAGES'; payload: { userId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: { userId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { userId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'SELECT_USER'; payload: string | null }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_USER_TYPING'; payload: { userId: string; isTyping: boolean } }
  | { type: 'SET_USER_ONLINE'; payload: { userId: string; isOnline: boolean } }
  | { type: 'UPDATE_USER_LAST_MESSAGE'; payload: { userId: string; lastMessageAt: string; messageCount: number } };

const initialState: MessagesState = {
  messages: {},
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
  searchQuery: '',
};

function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.userId]: action.payload.messages,
        },
      };
    case 'ADD_MESSAGE':
      const currentMessages = state.messages[action.payload.userId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.userId]: [...currentMessages, action.payload.message],
        },
      };
    case 'UPDATE_MESSAGE':
      const userMessages = state.messages[action.payload.userId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.userId]: userMessages.map(msg =>
            msg.id === action.payload.messageId
              ? { ...msg, ...action.payload.updates }
              : msg
          ),
        },
      };
    case 'SELECT_USER':
      return { ...state, selectedUserId: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_USER_TYPING':
      return {
        ...state,
        users: state.users.map(user =>
          user.tg_id === action.payload.userId
            ? { ...user, isTyping: action.payload.isTyping }
            : user
        ),
      };
    case 'SET_USER_ONLINE':
      return {
        ...state,
        users: state.users.map(user =>
          user.tg_id === action.payload.userId
            ? { ...user, isOnline: action.payload.isOnline }
            : user
        ),
      };
    case 'UPDATE_USER_LAST_MESSAGE':
      return {
        ...state,
        users: state.users.map(user =>
          user.tg_id === action.payload.userId
            ? { 
                ...user, 
                lastMessageAt: action.payload.lastMessageAt,
                messageCount: action.payload.messageCount > 0 ? action.payload.messageCount : user.messageCount + 1
              }
            : user
        ),
      };
    default:
      return state;
  }
}

interface MessagesContextType extends MessagesState {
  fetchUsers: () => Promise<void>;
  fetchMessages: (userId: string, page?: number) => Promise<void>;
  sendMessage: (text: string, userId: string) => Promise<void>;
  selectUser: (userId: string | null) => void;
  setSearch: (query: string) => void;
  markAsRead: (userId: string) => void;
  // Real-time функции (заготовки)
  setUserTyping: (userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  updateUserLastMessage: (userId: string, lastMessageAt: string, messageCount: number) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(messagesReducer, initialState);

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      dispatch({ type: 'SET_USERS', payload: data.users });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string, page = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`/api/messages?tg_id=${userId}&page=${page}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      dispatch({ type: 'SET_MESSAGES', payload: { userId, messages: data.messages } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const sendMessage = useCallback(async (text: string, userId: string) => {
    const now = new Date().toISOString();
    
    // Оптимистичное обновление
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text,
      tg_id: userId,
      created_at: now,
      updated_at: now,
      is_incoming: false,
      tg_msg_id: null,
      data: null,
      status: 'sending',
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { userId, message: tempMessage } });
    
    // Сразу обновляем время последнего сообщения для мгновенной сортировки
    dispatch({
      type: 'UPDATE_USER_LAST_MESSAGE',
      payload: {
        userId,
        lastMessageAt: now,
        messageCount: 0 // Будет обновлено при следующем fetchUsers
      }
    });

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tg_id: userId,
          is_incoming: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const newMessage: Message = await response.json();
      
      // Заменяем временное сообщение на реальное
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { 
          userId, 
          messageId: tempMessage.id, 
          updates: { ...newMessage, status: 'sent' } 
        } 
      });

      // Перезагружаем список пользователей для синхронизации с сервером
      setTimeout(() => fetchUsers(), 1000);
      
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_MESSAGE', 
        payload: { 
          userId, 
          messageId: tempMessage.id, 
          updates: { status: 'failed' } 
        } 
      });
      throw error;
    }
  }, [fetchUsers]);

  const selectUser = useCallback((userId: string | null) => {
    dispatch({ type: 'SELECT_USER', payload: userId });
    if (userId) {
      fetchMessages(userId);
    }
  }, [fetchMessages]);

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  }, []);

  const markAsRead = useCallback((userId: string) => {
    // TODO: Реализовать отметку как прочитанное
  }, []);

  const setUserTyping = useCallback((userId: string, isTyping: boolean) => {
    dispatch({ type: 'SET_USER_TYPING', payload: { userId, isTyping } });
  }, []);

  const setUserOnline = useCallback((userId: string, isOnline: boolean) => {
    dispatch({ type: 'SET_USER_ONLINE', payload: { userId, isOnline } });
  }, []);

  const updateUserLastMessage = useCallback((userId: string, lastMessageAt: string, messageCount: number) => {
    dispatch({ type: 'UPDATE_USER_LAST_MESSAGE', payload: { userId, lastMessageAt, messageCount } });
  }, []);

  // Загружаем пользователей при инициализации
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Периодическое обновление списка пользователей для актуализации времени последних сообщений
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000); // Обновляем каждые 30 секунд

    return () => clearInterval(interval);
  }, [fetchUsers]);

  const contextValue: MessagesContextType = {
    ...state,
    fetchUsers,
    fetchMessages,
    sendMessage,
    selectUser,
    setSearch,
    markAsRead,
    setUserTyping,
    setUserOnline,
    updateUserLastMessage,
  };

  return (
    <MessagesContext.Provider value={contextValue}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessagesContext() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessagesContext must be used within a MessagesProvider');
  }
  return context;
} 