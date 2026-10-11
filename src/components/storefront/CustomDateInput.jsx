'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

export default function CustomDateInput({
  value = '',
  onChange,
  placeholder = 'DD/MM/YYYY',
  required = false,
  className = '',
  id,
  name,
}) {
  const hiddenPickerRef = useRef(null);

  // Convert DD/MM/YYYY to YYYY-MM-DD for native date picker
  const toIsoDate = (val) => {
    if (!val || typeof val !== 'string') return '';
    const clean = val.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
    const parts = clean.split('/');
    if (parts.length === 3 && parts[2]?.length === 4) {
      const [d, m, y] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return '';
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY
  const fromIsoDate = (iso) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return iso;
  };

  const handleOpenPicker = () => {
    if (hiddenPickerRef.current) {
      try {
        if (typeof hiddenPickerRef.current.showPicker === 'function') {
          hiddenPickerRef.current.showPicker();
        } else {
          hiddenPickerRef.current.focus();
          hiddenPickerRef.current.click();
        }
      } catch (err) {
        hiddenPickerRef.current.click();
      }
    }
  };

  const handlePickerChange = (e) => {
    const isoVal = e.target.value;
    if (isoVal && onChange) {
      onChange(fromIsoDate(isoVal));
    }
  };

  const handleTextInputChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleBlur = (e) => {
    const raw = e.target.value?.trim() || '';
    const digits = raw.replace(/\D/g, '');
    // If the user typed 8 pure digits like 25102026, format to 25/10/2026
    if (digits.length === 8 && !raw.includes('/')) {
      const formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      if (onChange) onChange(formatted);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        id={id}
        name={name}
        value={value || ''}
        onChange={handleTextInputChange}
        onBlur={handleBlur}
        placeholder={placeholder || 'DD/MM/YYYY'}
        required={required}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={handleOpenPicker}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-900 transition rounded-md hover:bg-stone-100 cursor-pointer"
        title="Open calendar picker"
        aria-label="Open calendar picker"
        tabIndex={-1}
      >
        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#A47A1A]" />
      </button>
      <input
        ref={hiddenPickerRef}
        type="date"
        value={toIsoDate(value)}
        onChange={handlePickerChange}
        className="absolute opacity-0 pointer-events-none w-0 h-0 -z-10"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
