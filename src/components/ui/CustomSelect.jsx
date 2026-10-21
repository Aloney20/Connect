import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  children,
  className = '',
  disabled = false,
  placeholder = 'Select an option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse children to extract options
  const options = [];
  React.Children.toArray(children).forEach((child) => {
    if (child && child.type === 'option') {
      options.push({
        value: child.props.value,
        label: child.props.children
      });
    }
  });

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        const dropdownElement = document.getElementById('custom-select-dropdown');
        if (dropdownElement && dropdownElement.contains(event.target)) {
          return;
        }
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Position calculation for portal
  const [dropdownStyle, setDropdownStyle] = useState({});
  
  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'absolute',
        top: `${rect.bottom + window.scrollY + 4}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        zIndex: 9999
      });
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    if (disabled) return;
    const syntheticEvent = {
      target: { value: val },
      currentTarget: { value: val },
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    if (onChange) {
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const widthClass = className.includes('w-') ? className.split(' ').filter(c => c.startsWith('w-')).join(' ') : 'w-full';

  return (
    <div className={`relative ${widthClass}`} ref={containerRef}>
      {/* Hidden native select for form compatibility */}
      <select value={value} onChange={() => {}} className="hidden" disabled={disabled}>
        {children}
      </select>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          background: '#ffffff',
          border: `1px solid ${isOpen ? '#1a56db' : '#d1d5db'}`,
          boxShadow: isOpen ? '0 0 0 3px rgba(26,86,219,0.12)' : 'none',
          color: selectedOption ? '#0f172a' : '#9ca3af',
          borderRadius: '0.75rem',
          padding: '0.625rem 0.875rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: '#64748b',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        />
      </button>

      {/* Dropdown Menu via Portal */}
      {isOpen && createPortal(
        <div
          id="custom-select-dropdown"
          style={{
            ...dropdownStyle,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            padding: '0.25rem',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{maxHeight:'240px',overflowY:'auto',overflowX:'hidden'}}>
            {options.length === 0 ? (
              <div style={{padding:'0.5rem 0.75rem',fontSize:'0.875rem',color:'#9ca3af'}}>No options</div>
            ) : (
              options.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={`${opt.value}-${index}`}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: isSelected ? 600 : 500,
                      background: isSelected ? '#dbeafe' : 'transparent',
                      color: isSelected ? '#1a56db' : '#374151',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = '#f0f5ff'; e.currentTarget.style.color = '#1a56db'; }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}}
                  >
                    <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{opt.label}</span>
                    {isSelected && <Check size={15} style={{color:'#1a56db',flexShrink:0}} />}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

