import React, { useState, useEffect, useRef } from 'react';
import { useVisualEditor } from './VisualEditorContext';

export const EditableText = ({ tag: Tag = 'span', settingKey, defaultText, className }) => {
  const { isAdminMode, settings, updateSetting } = useVisualEditor();
  const displayText = settings[settingKey] !== undefined ? settings[settingKey] : defaultText;
  const [isFocused, setIsFocused] = useState(false);
  const textRef = useRef(null);

  // Update the DOM element when settings change externally (not while editing)
  useEffect(() => {
    if (textRef.current && !isFocused) {
      textRef.current.innerText = displayText;
    }
  }, [displayText, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    if (textRef.current) {
      const newText = textRef.current.innerText.trim();
      updateSetting(settingKey, newText);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textRef.current?.blur();
    }
  };

  if (!isAdminMode) {
    return <Tag className={className || ''}>{displayText}</Tag>;
  }

  return (
    <Tag
      ref={textRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      className={`${className || ''} editable-active ${isFocused ? 'editing' : ''}`}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{ 
        outline: 'none', 
        cursor: 'text',
        position: 'relative',
        minWidth: '60px',
        minHeight: '1.2em',
        display: 'inline-block'
      }}
    >
      {displayText}
    </Tag>
  );
};

export const EditableImage = ({ src, settingKey, alt, className, style }) => {
  const { isAdminMode, settings, updateSetting } = useVisualEditor();
  const currentSrc = settings[settingKey] || src;

  const handleChange = (e) => {
    if (!isAdminMode) return;
    e.stopPropagation();
    const newUrl = prompt('Nhập URL hình ảnh mới:', currentSrc);
    if (newUrl && newUrl.trim()) {
      updateSetting(settingKey, newUrl.trim());
    }
  };

  if (!isAdminMode) {
    return <img src={currentSrc} alt={alt} className={className} style={style} />;
  }

  const isBg = className?.includes('bg-img');

  return (
    <div 
      className={`editable-image-wrapper editable-active ${isBg ? 'bg-img' : ''}`} 
      onClick={handleChange} 
      style={{ 
        position: isBg ? 'absolute' : 'relative', 
        display: isBg ? 'block' : 'inline-block',
        width: isBg ? '100%' : 'auto',
        height: isBg ? '100%' : 'auto',
        ...style 
      }}
    >
      <img 
        src={currentSrc} 
        alt={alt} 
        className={className} 
        style={isBg ? { width: '100%', height: '100%', objectFit: 'cover' } : {}} 
      />
      <div className="image-overlay">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <span>Đổi ảnh</span>
      </div>
    </div>
  );
};
