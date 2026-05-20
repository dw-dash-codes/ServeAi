import { create } from 'zustand';
import { AgentLog, WorkflowStage } from '../types';

interface AgentState {
  trace: AgentLog[];
  currentStage: WorkflowStage;
  isRunning: boolean;
  setTrace: (trace: AgentLog[]) => void;
  addTrace: (log: AgentLog) => void;
  setCurrentStage: (stage: WorkflowStage) => void;
  setIsRunning: (running: boolean) => void;
  reset: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  trace: [],
  currentStage: 'parsing',
  isRunning: false,
  setTrace: (trace) => set({ trace }),
  addTrace: (log) => set((state) => ({ trace: [...state.trace, log] })),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setIsRunning: (running) => set({ isRunning: running }),
  reset: () =>
    set({
      trace: [],
      currentStage: 'parsing',
      isRunning: false,
    }),
}));
