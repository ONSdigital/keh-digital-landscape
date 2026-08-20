import { useEffect, useRef, useState } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';

function SettingsMenu({ settings, yearSelect, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="copilot-settings" ref={settingsRef}>
      <button
        className="copilot-settings-button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Open settings for page"
        aria-expanded={isOpen}
        aria-controls="copilot-settings-menu"
      >
        <IoSettingsOutline size={18} />
      </button>
      {isOpen && (
        <div className="copilot-settings-menu" id="copilot-settings-menu">
          {yearSelect && (
            <label className="copilot-settings-select-label">
              Year
              <select
                value={yearSelect.value}
                onChange={e => onChange('selectedYear', e.target.value)}
              >
                {yearSelect.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          )}
          {yearSelect && settings?.length > 0 && (
            <hr className="copilot-settings-divider" />
          )}
          {settings?.map(setting => (
            <label
              key={setting.key}
              className="copilot-settings-checkbox-label"
            >
              <input
                type="checkbox"
                checked={setting.checked}
                onChange={event => onChange(setting.key, event.target.checked)}
              />
              {setting.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default SettingsMenu;
