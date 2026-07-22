import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * A reusable themed select/dropdown for graphs.
 *
 * Props:
 *   options  — array of { value: string, label: string }
 *   value    — currently selected value string
 *   onChange — callback(selectedValue: string)
 */
const GraphSelect = ({ options, value, onChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#ffffff' : '#333333';
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  const borderColor = isDark ? '#555555' : '#cccccc';

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
      <select
        aria-label="Select graph option"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          padding: '6px 32px 6px 12px',
          borderRadius: '8px',
          border: `1px solid ${borderColor}`,
          backgroundColor: bgColor,
          color: textColor,
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%23ffffff' : '%23333333'}' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          minWidth: '110px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GraphSelect;
