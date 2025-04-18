import { create } from 'zustand';

interface Task {
  id: string;
  name: string;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  message?: string;
  error?: string;
  startTime: number;
  endTime?: number;
}

interface ReportingStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'startTime'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  clearCompletedTasks: () => void;
}

export const useReporting = create<ReportingStore>((set) => ({
  tasks: [],
  
  addTask: (task) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newTask: Task = {
      ...task,
      id,
      startTime: Date.now()
    };
    
    set((state) => ({
      tasks: [...state.tasks, newTask]
    }));
    
    return id;
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));
  },
  
  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
  },
  
  clearCompletedTasks: () => {
    set((state) => ({
      tasks: state.tasks.filter((task) => 
        task.status !== 'completed' && task.status !== 'failed'
      )
    }));
  }
}));