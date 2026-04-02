import React, { useState, useEffect } from 'react';
import '../../styles/components/Banner.css';

/**
 * Banner component for displaying important messages to users.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The banner title/heading
 * @param {string} props.description - The banner description/message
 * @param {string} props.type - The banner type (info, warning, error)
 * @param {Function} props.onClose - Optional callback when banner is closed
 * @returns {JSX.Element|null} The Banner component or null if hidden
 */
const Banner = ({ title, description, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Create a unique key for this banner in localStorage
  const bannerId = `dismissed_banner_${title}_${description}`.replace(
    /\s+/g,
    '_'
  );

  const handleClose = () => {
    setIsVisible(false);

    // Store the dismissed state in localStorage with current timestamp
    localStorage.setItem(
      bannerId,
      JSON.stringify({
        dismissedAt: new Date().getTime(),
      })
    );

    if (onClose) {
      onClose();
    }
  };

  // If the banner does not have a title, description, or type, we consider it invalid and
  // do not render it. The UI has logic to disallow creating banners without at least a
  // title, description, or type, but this is a safeguard.
  if (!(title || description || type)) {
    console.log(
      `Banner not rendered because it lacks title, description, and type.`
    );
    return null;
  }

  return (
    <div className={`banner banner-${type}`}>
      <div className="banner-content">
        {title && <h3 className="banner-title">{title}</h3>}
        {description && <p className="banner-description">{description}</p>}
      </div>
      <button className="banner-close-btn" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default Banner;
