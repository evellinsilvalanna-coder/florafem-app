import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { addDays, subDays, differenceInDays, format, parseISO, isWithinInterval, startOfDay } from 'date-fns';

const AppContext = createContext();

const STORAGE_KEY = 'florafem_data';

const defaultData = {
  user: {
    name: 'Evellin',
    email: '',
    avatar: null,
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: null,
    ttcMode: true, // Trying to Conceive
    partnerConnected: false,
    partnerEmail: '',
  },
  periods: [],
  symptoms: {},
  moods: {},
  sexActivity: [],
  health: {},
  notes: {},
  settings: {
    darkMode: false,
    notifications: true,
    reminderTime: '09:00',
    shareWithPartner: false,
    partnerToken: null,
  },
  cycles: [],
  weights: [],
  temperatures: [],
  waterLog: {},
  sleepLog: {},
};

function calculateCycleData(lastPeriodStart, cycleLength, periodLength) {
  if (!lastPeriodStart) return null;
  
  const today = startOfDay(new Date());
  const periodStart = startOfDay(parseISO(lastPeriodStart));
  const dayOfCycle = differenceInDays(today, periodStart) + 1;
  
  const nextPeriod = addDays(periodStart, cycleLength);
  const ovulationDay = addDays(periodStart, cycleLength - 14);
  const fertileStart = subDays(ovulationDay, 5);
  const fertileEnd = addDays(ovulationDay, 1);
  const periodEnd = addDays(periodStart, periodLength - 1);
  
  const isInPeriod = isWithinInterval(today, { start: periodStart, end: periodEnd });
  const isInFertile = isWithinInterval(today, { start: fertileStart, end: fertileEnd });
  const isOvulation = differenceInDays(today, ovulationDay) === 0;
  
  const daysToNextPeriod = differenceInDays(nextPeriod, today);
  const daysToOvulation = differenceInDays(ovulationDay, today);
  const daysToFertile = differenceInDays(fertileStart, today);
  
  let pregnancyChance = 'low';
  let pregnancyPercent = 5;
  if (isInFertile) {
    pregnancyChance = 'high';
    pregnancyPercent = isOvulation ? 30 : 20;
  } else if (daysToFertile <= 2 || daysToOvulation <= 3) {
    pregnancyChance = 'medium';
    pregnancyPercent = 10;
  }
  
  return {
    dayOfCycle,
    cycleLength,
    periodLength,
    periodStart,
    periodEnd,
    nextPeriod,
    ovulationDay,
    fertileStart,
    fertileEnd,
    isInPeriod,
    isInFertile,
    isOvulation,
    daysToNextPeriod,
    daysToOvulation,
    daysToFertile,
    pregnancyChance,
    pregnancyPercent,
  };
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return defaultData;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('florafem_theme') || 'light';
  });

  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('florafem_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const lastPopup = localStorage.getItem('florafem_last_popup');
    const today = format(new Date(), 'yyyy-MM-dd');
    if (lastPopup !== today) {
      setTimeout(() => {
        setShowDailyPopup(true);
        localStorage.setItem('florafem_last_popup', today);
      }, 1500);
    }
  }, []);

  const cycleData = calculateCycleData(
    data.user.lastPeriodStart,
    data.user.cycleLength,
    data.user.periodLength
  );

  const updateUser = useCallback((updates) => {
    setData(prev => ({ ...prev, user: { ...prev.user, ...updates } }));
  }, []);

  const logPeriod = useCallback((dateStr, flow, color = null, clots = false, note = '') => {
    setData(prev => {
      const periods = [...prev.periods];
      const existing = periods.findIndex(p => p.date === dateStr);
      if (existing >= 0) {
        periods[existing] = { ...periods[existing], flow, color, clots, note };
      } else {
        periods.push({ date: dateStr, flow, color, clots, note });
      }
      
      const lastPeriodDates = periods.filter(p => p.flow && p.flow !== 'none');
      const sorted = lastPeriodDates.sort((a, b) => a.date.localeCompare(b.date));
      const user = { ...prev.user };
      if (sorted.length > 0) {
        user.lastPeriodStart = sorted[sorted.length - 1].date;
        // Find start of current period
        let startDate = sorted[sorted.length - 1].date;
        for (let i = sorted.length - 2; i >= 0; i--) {
          const diff = differenceInDays(parseISO(sorted[i + 1].date), parseISO(sorted[i].date));
          if (diff <= 1) {
            startDate = sorted[i].date;
          } else {
            break;
          }
        }
        user.lastPeriodStart = startDate;
      }
      
      return { ...prev, periods, user };
    });
  }, []);

  const logSymptom = useCallback((dateStr, symptomType, symptomName, value) => {
    setData(prev => {
      const symptoms = { ...prev.symptoms };
      if (!symptoms[dateStr]) symptoms[dateStr] = {};
      if (!symptoms[dateStr][symptomType]) symptoms[dateStr][symptomType] = {};
      symptoms[dateStr][symptomType][symptomName] = value;
      return { ...prev, symptoms };
    });
  }, []);

  const logMood = useCallback((dateStr, mood, intensity = 3) => {
    setData(prev => {
      const moods = { ...prev.moods };
      if (!moods[dateStr]) moods[dateStr] = [];
      const existing = moods[dateStr].findIndex(m => m.mood === mood);
      if (existing >= 0) {
        moods[dateStr][existing] = { mood, intensity };
      } else {
        moods[dateStr].push({ mood, intensity });
      }
      return { ...prev, moods };
    });
  }, []);

  const logSex = useCallback((dateStr, type, ejaculation = false, note = '') => {
    setData(prev => {
      const sexActivity = [...prev.sexActivity];
      sexActivity.push({ date: dateStr, type, ejaculation, note, id: Date.now() });
      return { ...prev, sexActivity };
    });
  }, []);

  const logHealth = useCallback((dateStr, field, value) => {
    setData(prev => {
      const health = { ...prev.health };
      if (!health[dateStr]) health[dateStr] = {};
      health[dateStr][field] = value;
      return { ...prev, health };
    });
  }, []);

  const logWeight = useCallback((dateStr, weight) => {
    setData(prev => {
      const weights = [...prev.weights];
      const existing = weights.findIndex(w => w.date === dateStr);
      if (existing >= 0) {
        weights[existing] = { date: dateStr, weight };
      } else {
        weights.push({ date: dateStr, weight });
      }
      return { ...prev, weights };
    });
  }, []);

  const logTemperature = useCallback((dateStr, temp) => {
    setData(prev => {
      const temperatures = [...prev.temperatures];
      const existing = temperatures.findIndex(t => t.date === dateStr);
      if (existing >= 0) {
        temperatures[existing] = { date: dateStr, temp };
      } else {
        temperatures.push({ date: dateStr, temp });
      }
      return { ...prev, temperatures };
    });
  }, []);

  const logWater = useCallback((dateStr, glasses) => {
    setData(prev => {
      const waterLog = { ...prev.waterLog, [dateStr]: glasses };
      return { ...prev, waterLog };
    });
  }, []);

  const logSleep = useCallback((dateStr, hours, quality) => {
    setData(prev => {
      const sleepLog = { ...prev.sleepLog, [dateStr]: { hours, quality } };
      return { ...prev, sleepLog };
    });
  }, []);

  const addNote = useCallback((dateStr, note) => {
    setData(prev => {
      const notes = { ...prev.notes, [dateStr]: note };
      return { ...prev, notes };
    });
  }, []);

  const updateSettings = useCallback((updates) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, ...updates } }));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const getDayStatus = useCallback((dateStr) => {
    if (!data.user.lastPeriodStart) return 'normal';
    const date = parseISO(dateStr);
    const periodStart = parseISO(data.user.lastPeriodStart);
    const ovulationDay = addDays(periodStart, data.user.cycleLength - 14);
    const fertileStart = subDays(ovulationDay, 5);
    const fertileEnd = addDays(ovulationDay, 1);
    const periodEnd = addDays(periodStart, data.user.periodLength - 1);
    const nextPeriodStart = addDays(periodStart, data.user.cycleLength);
    const nextPeriodEnd = addDays(nextPeriodStart, data.user.periodLength - 1);
    
    const hasPeriodLog = data.periods.some(p => p.date === dateStr && p.flow && p.flow !== 'none');
    
    if (hasPeriodLog || isWithinInterval(date, { start: periodStart, end: periodEnd })) return 'period';
    if (isWithinInterval(date, { start: nextPeriodStart, end: nextPeriodEnd })) return 'period-predicted';
    if (differenceInDays(date, ovulationDay) === 0) return 'ovulation';
    if (isWithinInterval(date, { start: fertileStart, end: fertileEnd })) return 'fertile';
    return 'normal';
  }, [data.user, data.periods]);

  const getStats = useCallback(() => {
    const totalCycles = data.periods.length > 0 ? Math.max(1, Math.floor(data.periods.length / data.user.periodLength)) : 0;
    const ttcAttempts = data.sexActivity.filter(s => s.type === 'ttc' || s.type === 'unprotected').length;
    const totalSex = data.sexActivity.length;
    
    return {
      totalCycles,
      ttcAttempts,
      totalSex,
      avgCycleLength: data.user.cycleLength,
      regularity: 85,
    };
  }, [data]);

  const value = {
    data,
    theme,
    toggleTheme,
    cycleData,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    showDailyPopup,
    setShowDailyPopup,
    updateUser,
    logPeriod,
    logSymptom,
    logMood,
    logSex,
    logHealth,
    logWeight,
    logTemperature,
    logWater,
    logSleep,
    addNote,
    updateSettings,
    getDayStatus,
    getStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
