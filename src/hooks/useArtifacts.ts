/**
 * React Hook for Business Artifacts
 * 
 * Provides access to standardized business artifacts management
 * with task sessions, history, and KPI events.
 */

import { useState, useEffect, useCallback } from 'react';
import { getArtifactManager } from '../services/artifact-manager.js';
import {
  TaskSession,
  Artifact,
  ActionItem,
  KPIEvent,
  SessionHistory,
  ARTIFACT_TYPES,
  SESSION_STATUS,
  ACTION_PRIORITY,
} from '../types/business-artifacts.js';

export interface UseArtifactsReturn {
  // Sessions
  sessions: TaskSession[];
  currentSession: TaskSession | null;
  createSession: (partial: Partial<TaskSession>) => Promise<TaskSession>;
  updateSession: (sessionId: string, updates: Partial<TaskSession>) => Promise<TaskSession>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Artifacts
  artifacts: Artifact[];
  createActions: (sessionId: string, actions: ActionItem[]) => Promise<void>;
  createSummary: (sessionId: string, summary: any) => Promise<void>;
  createDraft: (sessionId: string, draft: any) => Promise<void>;
  
  // History and Analytics
  generateHistory: (filter?: any) => Promise<SessionHistory>;
  searchArtifacts: (query: string, options?: any) => Promise<Artifact[]>;
  
  // KPI Events
  recordKPIEvent: (event: any) => Promise<void>;
  getKPIEvents: (filter?: any) => Promise<KPIEvent[]>;
}

export function useArtifacts(): UseArtifactsReturn {
  const artifactManager = getArtifactManager();
  
  const [sessions, setSessions] = useState<TaskSession[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [currentSession, setCurrentSession] = useState<TaskSession | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const allSessions = await artifactManager.getSessions();
        const allArtifacts = await artifactManager.getArtifacts();
        
        setSessions(allSessions);
        setArtifacts(allArtifacts);
        
        // Set current active session if exists
        const activeSession = allSessions.find(s => s.status === SESSION_STATUS.ACTIVE);
        setCurrentSession(activeSession || null);
      } catch (error) {
        console.error('Failed to load initial artifacts data:', error);
      }
    };
    
    loadInitialData();
  }, [artifactManager]);

  const createSession = useCallback(async (partial: Partial<TaskSession>) => {
    try {
      const session = await artifactManager.createSession(partial);
      setSessions(prev => [...prev, session]);
      
      if (session.status === SESSION_STATUS.ACTIVE) {
        setCurrentSession(session);
      }
      
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  }, [artifactManager]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<TaskSession>) => {
    try {
      const updatedSession = await artifactManager.updateSession(sessionId, updates);
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }
      
      return updatedSession;
    } catch (error) {
      console.error('Failed to update session:', error);
      throw error;
    }
  }, [artifactManager, currentSession]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await artifactManager.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }, [artifactManager, currentSession]);

  const createActions = useCallback(async (sessionId: string, actions: ActionItem[]) => {
    try {
      await artifactManager.createActions(sessionId, actions);
      
      // Refresh artifacts for this session
      const sessionArtifacts = await artifactManager.getArtifacts({ sessionId });
      setArtifacts(prev => {
        const filtered = prev.filter(a => a.sessionId !== sessionId);
        return [...filtered, ...sessionArtifacts];
      });
    } catch (error) {
      console.error('Failed to create actions:', error);
      throw error;
    }
  }, [artifactManager]);

  const createSummary = useCallback(async (sessionId: string, summary: any) => {
    try {
      await artifactManager.createSummary(sessionId, summary);
      
      // Refresh artifacts for this session
      const sessionArtifacts = await artifactManager.getArtifacts({ sessionId });
      setArtifacts(prev => {
        const filtered = prev.filter(a => a.sessionId !== sessionId);
        return [...filtered, ...sessionArtifacts];
      });
    } catch (error) {
      console.error('Failed to create summary:', error);
      throw error;
    }
  }, [artifactManager]);

  const createDraft = useCallback(async (sessionId: string, draft: any) => {
    try {
      await artifactManager.createDraft(sessionId, draft);
      
      // Refresh artifacts for this session
      const sessionArtifacts = await artifactManager.getArtifacts({ sessionId });
      setArtifacts(prev => {
        const filtered = prev.filter(a => a.sessionId !== sessionId);
        return [...filtered, ...sessionArtifacts];
      });
    } catch (error) {
      console.error('Failed to create draft:', error);
      throw error;
    }
  }, [artifactManager]);

  const generateHistory = useCallback(async (filter?: any) => {
    try {
      const history = await artifactManager.generateHistory(filter);
      return history;
    } catch (error) {
      console.error('Failed to generate history:', error);
      throw error;
    }
  }, [artifactManager]);

  const searchArtifacts = useCallback(async (query: string, options?: any) => {
    try {
      const results = await artifactManager.search(query, options);
      return results;
    } catch (error) {
      console.error('Failed to search artifacts:', error);
      throw error;
    }
  }, [artifactManager]);

  const recordKPIEvent = useCallback(async (event: any) => {
    try {
      await artifactManager.recordKPIEvent(event);
    } catch (error) {
      console.error('Failed to record KPI event:', error);
      throw error;
    }
  }, [artifactManager]);

  const getKPIEvents = useCallback(async (filter?: any) => {
    try {
      const events = await artifactManager.getKPIEvents(filter);
      return events;
    } catch (error) {
      console.error('Failed to get KPI events:', error);
      throw error;
    }
  }, [artifactManager]);

  return {
    sessions,
    currentSession,
    createSession,
    updateSession,
    deleteSession,
    artifacts,
    createActions,
    createSummary,
    createDraft,
    generateHistory,
    searchArtifacts,
    recordKPIEvent,
    getKPIEvents,
  };
}
