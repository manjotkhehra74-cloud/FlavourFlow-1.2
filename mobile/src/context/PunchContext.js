import React, { createContext, useCallback, useContext, useState } from 'react';
import PunchModal from '../components/PunchModal';
import { Api } from '../api/client';

const PunchCtx = createContext(null);

export function PunchProvider({ children, enabled = true }) {
  const [visible, setVisible] = useState(false);
  const [today, setToday] = useState(null);
  const listeners = React.useRef([]);

  const refreshToday = useCallback(async () => {
    try {
      const t = await Api.attendanceToday();
      setToday(t.today);
      return t.today;
    } catch {
      return null;
    }
  }, []);

  const subscribe = useCallback((fn) => {
    listeners.current.push(fn);
    return () => {
      listeners.current = listeners.current.filter((x) => x !== fn);
    };
  }, []);

  const openPunch = useCallback((opts) => {
    if (opts?.today !== undefined) setToday(opts.today);
    else refreshToday();
    setVisible(true);
  }, [refreshToday]);

  const value = React.useMemo(
    () => ({ openPunch, today, setToday, refreshToday, subscribe }),
    [openPunch, today, refreshToday, subscribe]
  );

  return (
    <PunchCtx.Provider value={value}>
      {children}
      {enabled ? (
        <PunchModal
          visible={visible}
          today={today}
          onClose={() => setVisible(false)}
          onPunched={(res) => {
            setVisible(false);
            refreshToday();
            listeners.current.forEach((fn) => {
              try { fn(res); } catch {}
            });
          }}
        />
      ) : null}
    </PunchCtx.Provider>
  );
}

export const usePunch = () => useContext(PunchCtx) || {
  openPunch: () => {},
  today: null,
  setToday: () => {},
  refreshToday: async () => null,
  subscribe: () => () => {},
};
