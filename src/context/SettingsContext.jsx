import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicSettings } from '../api/client';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicSettings()
      .then(data => {
        setSettings(data);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
