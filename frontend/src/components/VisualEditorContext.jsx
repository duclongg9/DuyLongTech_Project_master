import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API } from '../api/client';

const VisualEditorContext = createContext();

export const useVisualEditor = () => useContext(VisualEditorContext);

export const VisualEditorProvider = ({ children, user, initialSettings }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [settings, setSettings] = useState(initialSettings || {});
  const [originalSettings, setOriginalSettings] = useState(initialSettings || {});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync when initialSettings updates from API (async load)
  useEffect(() => {
    if (initialSettings && Object.keys(initialSettings).length > 0) {
      setSettings(prev => {
        // Only update keys that haven't been locally modified
        if (!hasChanges) {
          return { ...initialSettings };
        }
        return prev;
      });
      setOriginalSettings(initialSettings);
    }
  }, [initialSettings]);

  const toggleAdminMode = () => {
    if (user?.role === 'ADMIN') {
      setIsAdminMode(prev => !prev);
    }
  };

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const saveChanges = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${API}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setHasChanges(false);
        setOriginalSettings({ ...settings });
        alert('✅ Cập nhật giao diện thành công!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Có lỗi xảy ra khi lưu cấu hình.');
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
    setIsAdminMode(false);
  };

  return (
    <VisualEditorContext.Provider value={{
      isAdminMode,
      toggleAdminMode,
      settings,
      updateSetting,
      saveChanges,
      discardChanges,
      isSaving,
      hasChanges
    }}>
      {children}
    </VisualEditorContext.Provider>
  );
};
