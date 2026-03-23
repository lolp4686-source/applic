import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuid } from 'uuid';
import { Bot, BotStatus, LogEntry, LogLevel } from '../types';

interface State {
  bots: Bot[];
  logs: LogEntry[];
  loaded: boolean;
}

type Action =
  | { type: 'LOAD'; bots: Bot[]; logs: LogEntry[] }
  | { type: 'ADD_BOT'; bot: Bot }
  | { type: 'UPDATE_BOT'; bot: Bot }
  | { type: 'DELETE_BOT'; id: string }
  | { type: 'SET_STATUS'; id: string; status: BotStatus }
  | { type: 'ADD_LOG'; log: LogEntry }
  | { type: 'CLEAR_LOGS'; botId?: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD':
      return { ...state, bots: action.bots, logs: action.logs, loaded: true };
    case 'ADD_BOT':
      return { ...state, bots: [...state.bots, action.bot] };
    case 'UPDATE_BOT':
      return { ...state, bots: state.bots.map(b => b.id === action.bot.id ? action.bot : b) };
    case 'DELETE_BOT':
      return {
        ...state,
        bots: state.bots.filter(b => b.id !== action.id),
        logs: state.logs.filter(l => l.botId !== action.id),
      };
    case 'SET_STATUS':
      return { ...state, bots: state.bots.map(b => b.id === action.id ? { ...b, status: action.status } : b) };
    case 'ADD_LOG':
      return { ...state, logs: [action.log, ...state.logs].slice(0, 1000) };
    case 'CLEAR_LOGS':
      return { ...state, logs: action.botId ? state.logs.filter(l => l.botId !== action.botId) : [] };
    default:
      return state;
  }
}

interface BotContextValue {
  bots: Bot[];
  logs: LogEntry[];
  loaded: boolean;
  addBot: (name: string, token: string, prefix: string) => void;
  updateBot: (bot: Bot) => void;
  deleteBot: (id: string) => void;
  setStatus: (id: string, status: BotStatus) => void;
  addLog: (botId: string, level: LogLevel, action: string, message: string) => void;
  clearLogs: (botId?: string) => void;
  getBotLogs: (botId: string) => LogEntry[];
}

const BotContext = createContext<BotContextValue | null>(null);

const STORAGE_BOTS = '@bots';
const STORAGE_LOGS = '@logs';

export function BotProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { bots: [], logs: [], loaded: false });

  useEffect(() => {
    (async () => {
      try {
        const [botsJson, logsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_BOTS),
          AsyncStorage.getItem(STORAGE_LOGS),
        ]);
        dispatch({
          type: 'LOAD',
          bots: botsJson ? JSON.parse(botsJson) : [],
          logs: logsJson ? JSON.parse(logsJson) : [],
        });
      } catch {
        dispatch({ type: 'LOAD', bots: [], logs: [] });
      }
    })();
  }, []);

  useEffect(() => {
    if (state.loaded) {
      AsyncStorage.setItem(STORAGE_BOTS, JSON.stringify(state.bots));
      AsyncStorage.setItem(STORAGE_LOGS, JSON.stringify(state.logs));
    }
  }, [state.bots, state.logs, state.loaded]);

  const addBot = useCallback((name: string, token: string, prefix: string) => {
    const bot: Bot = { id: uuid(), name, token, prefix, status: 'offline', createdAt: Date.now() };
    dispatch({ type: 'ADD_BOT', bot });
    dispatch({ type: 'ADD_LOG', log: { id: uuid(), botId: bot.id, timestamp: Date.now(), level: 'success', action: 'Création', message: `Bot "${name}" ajouté` } });
  }, []);

  const updateBot = useCallback((bot: Bot) => {
    dispatch({ type: 'UPDATE_BOT', bot });
    dispatch({ type: 'ADD_LOG', log: { id: uuid(), botId: bot.id, timestamp: Date.now(), level: 'info', action: 'Modification', message: `Bot "${bot.name}" modifié` } });
  }, []);

  const deleteBot = useCallback((id: string) => {
    const bot = state.bots.find(b => b.id === id);
    dispatch({ type: 'DELETE_BOT', id });
    if (bot) {
      dispatch({ type: 'ADD_LOG', log: { id: uuid(), botId: id, timestamp: Date.now(), level: 'warn', action: 'Suppression', message: `Bot "${bot.name}" supprimé` } });
    }
  }, [state.bots]);

  const setStatus = useCallback((id: string, status: BotStatus) => {
    dispatch({ type: 'SET_STATUS', id, status });
    const bot = state.bots.find(b => b.id === id);
    const level: LogLevel = status === 'online' ? 'success' : status === 'error' ? 'error' : 'info';
    dispatch({ type: 'ADD_LOG', log: { id: uuid(), botId: id, timestamp: Date.now(), level, action: 'Statut', message: `${bot?.name ?? 'Bot'} → ${status}` } });
  }, [state.bots]);

  const addLog = useCallback((botId: string, level: LogLevel, action: string, message: string) => {
    dispatch({ type: 'ADD_LOG', log: { id: uuid(), botId, timestamp: Date.now(), level, action, message } });
  }, []);

  const clearLogs = useCallback((botId?: string) => {
    dispatch({ type: 'CLEAR_LOGS', botId });
  }, []);

  const getBotLogs = useCallback((botId: string) => {
    return state.logs.filter(l => l.botId === botId);
  }, [state.logs]);

  return (
    <BotContext.Provider value={{ ...state, addBot, updateBot, deleteBot, setStatus, addLog, clearLogs, getBotLogs }}>
      {children}
    </BotContext.Provider>
  );
}

export function useBots() {
  const ctx = useContext(BotContext);
  if (!ctx) throw new Error('useBots must be used within BotProvider');
  return ctx;
}
