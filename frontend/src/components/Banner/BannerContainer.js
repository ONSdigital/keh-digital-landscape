import React, { useEffect, useState } from 'react';
import Banner from './Banner';
import { useData } from '../../contexts/dataContext';

/**
 * Container component that fetches and displays banners for a specific page.
 *
 * @param {Object} props - Component props
 * @param {string} props.page - The page name ('radar', 'statistics', or 'projects')
 * @returns {JSX.Element} The BannerContainer component
 */
const BannerContainer = ({ page }) => {
  const { getPageBanners } = useData();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const pageBanners = await getPageBanners(page);
        setBanners(pageBanners);
      } catch (error) {
        console.error(`Error fetching banners for ${page}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (page) {
      fetchBanners();
    }
  }, [page, getPageBanners]);

  if (loading || banners.length === 0) {
    return null;
  }

  // If the backend ever returns multiple banners for a page, log a warning and only render the first one
  // This should never happen due to backend filtering, but we want to handle it gracefully just in case
  if (banners.length > 1) {
    console.warn(
      `Multiple banners found for page "${page}". Backend should only ever return one banner per page. Rendering the first banner.`
    );

    // Only render the first banner if multiple are returned
    banners.splice(1);
  }

  return (
    <div className="banner-fixed">
      {banners.map((banner, index) => (
        <Banner
          key={index}
          title={banner.title}
          description={banner.description}
          type={banner.type}
          onClose={() => {
            // Remove banner from local state when closed
            setBanners([]);
          }}
        />
      ))}
    </div>
  );
};

export default BannerContainer;
