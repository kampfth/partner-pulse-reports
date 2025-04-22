
import React, { createContext, useContext, useState, ReactNode } from 'react';

type FileStatus = 'none' | 'uploaded' | 'processing' | 'processed';
type ActiveSection = 'dashboard' | 'reports' | 'control-panel';

interface AppContextType {
  fileStatus: FileStatus;
  setFileStatus: (status: FileStatus) => void;
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  echoOnly: boolean;
  setEchoOnly: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [fileStatus, setFileStatus] = useState<FileStatus>('none');
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [echoOnly, setEchoOnly] = useState(false);

  return (
    <AppContext.Provider
      value={{
        fileStatus,
        setFileStatus,
        activeSection,
        setActiveSection,
        isAuthenticated,
        setIsAuthenticated,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        echoOnly,
        setEchoOnly
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
