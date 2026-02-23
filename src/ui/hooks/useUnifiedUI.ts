/**
 * Kair0s Unified UI Hook
 * 
 * Provides consistent UI state management across all components
 * with unified loading, error, and success states.
 */

import { useState, useEffect, useCallback } from 'react';

export interface UIState {
  // Global loading states
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
  
  // Error states
  errors: {
    global: string | null;
    components: Record<string, string | null>;
    notifications: Array<{
      id: string;
      type: 'error' | 'warning' | 'info' | 'success';
      message: string;
      timestamp: number;
      dismissible: boolean;
    }>;
  };
  
  // Success states
  success: {
    global: boolean;
    components: Record<string, boolean>;
    messages: Array<{
      id: string;
      message: string;
      timestamp: number;
      component?: string;
    }>;
  };
  
  // Theme and preferences
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
  };
  
  // Layout states
  layout: {
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    headerHeight: number;
    contentPadding: number;
  };
}

export interface UseUIReturn {
  // Current state
  state: UIState;
  
  // Loading management
  setLoading: (component?: string, loading?: boolean) => void;
  isLoading: (component?: string) => boolean;
  
  // Error management
  setError: (component?: string, error?: string | null) => void;
  clearError: (component?: string) => void;
  addNotification: (notification: Omit<UIState['errors']['notifications'][0], 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Success management
  setSuccess: (component?: string, success?: boolean) => void;
  isSuccess: (component?: string) => boolean;
  addSuccessMessage: (message: string, component?: string) => void;
  clearSuccessMessages: () => void;
  
  // Theme management
  setTheme: (theme: Partial<UIState['theme']>) => void;
  
  // Layout management
  setLayout: (layout: Partial<UIState['layout']>) => void;
  
  // Utilities
  reset: () => void;
  getStateSnapshot: () => UIState;
}

export function useUnifiedUI(): UseUIReturn {
  const [state, setState] = useState<UIState>({
    loading: {
      global: false,
      components: {},
    },
    errors: {
      global: null,
      components: {},
      notifications: [],
    },
    success: {
      global: false,
      components: {},
      messages: [],
    },
    theme: {
      mode: 'auto',
      primaryColor: '#0ea5e9',
    },
    layout: {
      sidebarOpen: true,
      sidebarCollapsed: false,
      headerHeight: 64,
      contentPadding: 24,
    },
  });

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          notifications: prev.errors.notifications.filter(
            notification => !notification.dismissible || 
            Date.now() - notification.timestamp < 5000
          ),
        },
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const setLoading = useCallback((component?: string, loading?: boolean) => {
    setState(prev => ({
      ...prev,
      loading: {
        ...prev.loading,
        global: component === undefined ? (loading ?? false) : prev.loading.global,
        ...(component && { [component]: loading ?? true }),
      },
    }));
  }, []);

  const isLoading = useCallback((component?: string) => {
    if (component === undefined) {
      return state.loading.global;
    }
    return state.loading.components[component] || false;
  }, [state.loading]);

  const setError = useCallback((component?: string, error?: string | null) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        global: component === undefined ? (error ?? null) : prev.errors.global,
        ...(component && { [component]: error ?? null }),
      },
    }));
  }, []);

  const clearError = useCallback((component?: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        global: component === undefined ? null : prev.errors.global,
        ...(component && { [component]: null }),
      },
    }));
  }, []);

  const addNotification = useCallback((
    notification: Omit<UIState['errors']['notifications'][0], 'id' | 'timestamp'>
  ) => {
    const newNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        notifications: [...prev.errors.notifications, newNotification],
      },
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        notifications: prev.errors.notifications.filter(n => n.id !== id),
      },
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        notifications: [],
      },
    }));
  }, []);

  const setSuccess = useCallback((component?: string, success?: boolean) => {
    setState(prev => ({
      ...prev,
      success: {
        ...prev.success,
        global: component === undefined ? (success ?? false) : prev.success.global,
        ...(component && { [component]: success ?? true }),
      },
    }));
  }, []);

  const isSuccess = useCallback((component?: string) => {
    if (component === undefined) {
      return state.success.global;
    }
    return state.success.components[component] || false;
  }, [state.success]);

  const addSuccessMessage = useCallback((message: string, component?: string) => {
    const newMessage = {
      id: `success_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: Date.now(),
      component,
    };

    setState(prev => ({
      ...prev,
      success: {
        ...prev.success,
        global: true,
        messages: [...prev.success.messages, newMessage],
      },
    }));
  }, []);

  const clearSuccessMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      success: {
        ...prev.success,
        global: false,
        messages: [],
      },
    }));
  }, []);

  const setTheme = useCallback((theme: Partial<UIState['theme']>) => {
    setState(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...theme,
      },
    }));
  }, []);

  const setLayout = useCallback((layout: Partial<UIState['layout']>) => {
    setState(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        ...layout,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: { global: false, components: {} },
      errors: { global: null, components: {}, notifications: [] },
      success: { global: false, components: {}, messages: [] },
      theme: { mode: 'auto', primaryColor: '#0ea5e9' },
      layout: { sidebarOpen: true, sidebarCollapsed: false, headerHeight: 64, contentPadding: 24 },
    });
  }, []);

  const getStateSnapshot = useCallback(() => {
    return { ...state };
  }, [state]);

  return {
    state,
    setLoading,
    isLoading,
    setError,
    clearError,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    setSuccess,
    isSuccess,
    addSuccessMessage,
    clearSuccessMessages,
    setTheme,
    setLayout,
    reset,
    getStateSnapshot,
  };
}
