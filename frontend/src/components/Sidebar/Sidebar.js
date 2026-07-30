import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import '../../styles/components/Sidebar.css';
import HelpModal from '../Header/HelpModal';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import UserProfile from '../UserProfile/UserProfile';
import Modal from '../BugReport/Modal';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { TbHelp, TbBug } from 'react-icons/tb';
import {
  generalNavigationItems,
  restrictedNavigationItems,
  isNavigationItemActive,
} from '../../constants/navigationConstants';

const Sidebar = () => {
  const location = useLocation();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const handleSetShowHelpModal = () => {
    setShowHelpModal(!showHelpModal);
  };

  const openReportBugModal = () => {
    setShowBugReportModal(true);
  };

  const closeReportBugModal = () => {
    setShowBugReportModal(false);
  };

  const renderNavItems = items => {
    return items.map(item =>
      item.isLink ? (
        <Link
          key={item.path}
          to={item.path}
          className={`sidebar-link ${isNavigationItemActive(item, location.pathname) ? 'active' : ''}`}
          aria-label={item.label}
        >
          <span className="sidebar-icon">
            <item.icon />
          </span>
          {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
        </Link>
      ) : (
        <a
          key={item.path}
          href={item.path}
          className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          aria-label={item.label}
        >
          <span className="sidebar-icon">
            <item.icon />
          </span>
          {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
        </a>
      )
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {renderNavItems(generalNavigationItems)}

        {/* Restricted Section */}
        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-section-title">Restricted</div>
          )}
          {renderNavItems(restrictedNavigationItems)}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-footer-buttons">
          <button
            onClick={() => openReportBugModal()}
            className="sidebar-footer-button"
            aria-label="Open report bug modal"
          >
            <span className="sidebar-icon">
              <TbBug />
            </span>
            {!isCollapsed && (
              <span className="sidebar-label">Report a Bug</span>
            )}
          </button>
          <Modal isOpen={showBugReportModal} onClose={closeReportBugModal} />
          <button
            onClick={() => handleSetShowHelpModal()}
            className="sidebar-footer-button"
            aria-label="Help button to open help modal"
          >
            <span className="sidebar-icon">
              <TbHelp />
            </span>
            {!isCollapsed && <span className="sidebar-label">Help</span>}
          </button>
          <ThemeToggle variant={isCollapsed ? 'small' : 'large'} />
          <button
            className="sidebar-footer-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <IoChevronForward /> : <IoChevronBack />}

            {!isCollapsed && (
              <span className="sidebar-label">Collapse Sidebar</span>
            )}
          </button>
        </div>
        <UserProfile variant="sidebar" isCollapsed={isCollapsed} />
      </div>
      <HelpModal
        show={showHelpModal}
        onClose={() => handleSetShowHelpModal()}
      />
    </aside>
  );
};

export default Sidebar;
