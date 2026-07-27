import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/components/MenuDropdown.css';
import UserProfile from '../UserProfile/UserProfile';
import Modal from '../BugReport/Modal';
import { TbHelp, TbBug } from 'react-icons/tb';
import { IoMenu } from 'react-icons/io5';
import {
  generalNavigationItems,
  restrictedNavigationItems,
  isNavigationItemActive,
} from '../../constants/navigationConstants';

/**
 * MenuDropdown component for displaying a dropdown menu with navigation links.
 *
 * @param {Object} props - The props passed to the MenuDropdown component.
 * @param {Function} props.setShowHelpModal - Function to show the help modal.
 */
function MenuDropdown({ setShowHelpModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const homeItem = generalNavigationItems[0];
  const HomeIcon = homeItem.icon;

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * handleNavClick function navigates to the specified path and closes the dropdown menu.
   *
   * @param {string} path - The path to navigate to.
   */
  const handleNavClick = path => {
    navigate(path);
    setIsOpen(false);
  };

  const handleHelpClick = () => {
    setShowHelpModal(true);
    setIsOpen(false);
  };

  const openReportBugModal = () => {
    setShowBugReportModal(true);
  };

  const closeReportBugModal = () => {
    setShowBugReportModal(false);
  };

  return (
    <div className="menu-dropdown" ref={dropdownRef}>
      <button
        className="menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open menu"
      >
        <IoMenu size={16} />
      </button>

      {isOpen && (
        <div className="dropdown-content">
          <div className="home-button-container">
            <button
              onClick={() => handleNavClick(homeItem.path)}
              className={location.pathname === '/' ? 'active' : ''}
            >
              <HomeIcon size={16} />
              {homeItem.label}
            </button>
          </div>

          <div className="menu-section">
            {generalNavigationItems.slice(1).map(item => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={
                  isNavigationItemActive(item, location.pathname)
                    ? 'active'
                    : ''
                }
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="menu-section restricted-section">
            <div className="menu-section-title">Restricted</div>
            {/* Keep these as <a> tags for proper authentication handling */}
            {restrictedNavigationItems.map(item => (
              <a
                key={item.path}
                href={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <item.icon size={16} />
                {item.label}
              </a>
            ))}
          </div>

          <div className="help-button-container">
            <button onClick={() => openReportBugModal()}>
              <TbBug size={16} />
              Report a Bug
            </button>
            <button onClick={handleHelpClick}>
              <TbHelp size={16} />
              Help
            </button>
          </div>

          <UserProfile variant="dropdown" />
        </div>
      )}
      <Modal isOpen={showBugReportModal} onClose={closeReportBugModal} />
    </div>
  );
}

export default MenuDropdown;
