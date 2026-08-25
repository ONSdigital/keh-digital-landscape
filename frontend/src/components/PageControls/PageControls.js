import BackButton from './Backbutton';
import SettingsMenu from './SettingsMenu';
import '../../styles/Copilot/ReusableStyles.css';

/**
 * PageControls component for page navigation and optional settings.
 * @param {string} previousPage - The page the back button navigates to.
 * @param {string} [backLabel] - Custom label for the back button.
 * @param {string} [backAriaLabel] - Custom aria-label for the back button.
 * @param {Array<{key: string, label: string, checked: boolean}>} [settings] - Settings checkboxes to display.
 * @param {function} [onSettingChange] - Callback when a setting changes: (key, checked) => void.
 */
function PageControls({
  previousPage,
  backLabel,
  backAriaLabel,
  settings,
  yearSelect,
  onSettingChange,
}) {
  const showSettings = (settings || yearSelect) && onSettingChange;
  return (
    <div className="copilot-page-controls">
      <BackButton
        previousPage={previousPage}
        label={backLabel}
        ariaLabel={backAriaLabel}
      />
      {showSettings && (
        <SettingsMenu
          settings={settings}
          yearSelect={yearSelect}
          onChange={onSettingChange}
        />
      )}
    </div>
  );
}

export default PageControls;
