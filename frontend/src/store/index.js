/**
 * Global State Management using Zustand
 */

import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// User Store
export const useUserStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
        
        updateProfile: (updates) => set((state) => ({
          user: { ...state.user, ...updates }
        })),
      }),
      {
        name: 'user-store',
      }
    )
  )
);

// Code Editor Store
export const useCodeStore = create(
  devtools((set, get) => ({
    code: '',
    language: 'python',
    input: '',
    output: '',
    isExecuting: false,
    error: null,
    
    setCode: (code) => set({ code }),
    setLanguage: (language) => set({ language }),
    setInput: (input) => set({ input }),
    setOutput: (output) => set({ output }),
    setIsExecuting: (isExecuting) => set({ isExecuting }),
    setError: (error) => set({ error }),
    
    reset: () => set({
      code: '',
      language: 'python',
      input: '',
      output: '',
      error: null,
    }),
  }))
);

// Interview Store
export const useInterviewStore = create(
  devtools((set, get) => ({
    isRecording: false,
    isCameraOn: true,
    isMicOn: true,
    transcript: [],
    duration: 0,
    currentQuestion: null,
    aiResponse: null,
    
    setIsRecording: (isRecording) => set({ isRecording }),
    setIsCameraOn: (isCameraOn) => set({ isCameraOn }),
    setIsMicOn: (isMicOn) => set({ isMicOn }),
    addTranscript: (entry) => set((state) => ({
      transcript: [...state.transcript, entry]
    })),
    setDuration: (duration) => set({ duration }),
    setCurrentQuestion: (question) => set({ currentQuestion: question }),
    setAiResponse: (response) => set({ aiResponse: response }),
    
    reset: () => set({
      isRecording: false,
      isCameraOn: true,
      isMicOn: true,
      transcript: [],
      duration: 0,
      currentQuestion: null,
      aiResponse: null,
    }),
  }))
);

// Community Store
export const useCommunityStore = create(
  devtools((set, get) => ({
    threads: [],
    selectedThread: null,
    filter: 'all', // all, discussions, questions, suggestions
    searchQuery: '',
    
    setThreads: (threads) => set({ threads }),
    setSelectedThread: (thread) => set({ selectedThread: thread }),
    setFilter: (filter) => set({ filter }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    
    addThread: (thread) => set((state) => ({
      threads: [thread, ...state.threads]
    })),
    
    updateThread: (threadId, updates) => set((state) => ({
      threads: state.threads.map(t => 
        t._id === threadId ? { ...t, ...updates } : t
      )
    })),
    
    addReply: (threadId, reply) => set((state) => ({
      threads: state.threads.map(t =>
        t._id === threadId 
          ? { ...t, replies: [...(t.replies || []), reply] }
          : t
      )
    })),
  }))
);

// Notification Store
export const useNotificationStore = create(
  devtools((set, get) => ({
    notifications: [],
    
    addNotification: (notification) => set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now(), ...notification }
      ]
    })),
    
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
  }))
);

// UI Store
export const useUIStore = create(
  devtools((set, get) => ({
    sidebarOpen: true,
    theme: 'light',
    
    toggleSidebar: () => set((state) => ({
      sidebarOpen: !state.sidebarOpen
    })),
    setTheme: (theme) => set({ theme }),
  }))
);
