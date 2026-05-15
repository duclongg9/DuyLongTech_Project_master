import React from 'react';
import { useVisualEditor } from './VisualEditorContext';

export default function VisualToolbar({ user }) {
  const { isAdminMode, toggleAdminMode, saveChanges, discardChanges, isSaving, hasChanges } = useVisualEditor();

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isAdminMode
          ? '1px solid rgba(0, 240, 255, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '100px',
        padding: '8px 20px',
        boxShadow: isAdminMode
          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,243,255,0.4)'
          : '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(0,243,255,0.15)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* Badge */}
      <span
        style={{
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '1px',
          color: 'var(--accent)',
          background: 'rgba(0, 240, 255, 0.1)',
          padding: '3px 10px',
          borderRadius: '4px',
        }}
      >
        ADMIN
      </span>

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <span
          style={{
            fontSize: '11px',
            color: '#ff9f43',
            fontWeight: 600,
            animation: 'blink 2s infinite',
          }}
        >
          ● Chưa lưu
        </span>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {!isAdminMode ? (
          <button className="btn btn-neon-cyan btn-sm" onClick={toggleAdminMode}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Sửa Giao Diện
          </button>
        ) : (
          <>
            <button
              className="btn btn-dark btn-sm"
              onClick={discardChanges}
            >
              Hủy
            </button>
            <button
              className="btn btn-cta btn-sm"
              onClick={saveChanges}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
            <button
              className="btn btn-neon-cyan btn-sm"
              onClick={toggleAdminMode}
            >
              Thoát
            </button>
          </>
        )}
      </div>
    </div>
  );
}
