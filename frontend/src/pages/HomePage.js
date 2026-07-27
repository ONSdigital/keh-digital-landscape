import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useData } from '../contexts/dataContext';
import Changelog from '../components/HomePage/Changelog';
import RecentBanners from '../components/HomePage/RecentBanners';
import BugReport from '../components/BugReport/Home';
import '../styles/HomePage.css';
import Layout from '../components/Layout/Layout';
import { homePageNavigationItems } from '../constants/navigationConstants';

/**
 * HomePage component for displaying the home page.
 *
 * @returns {JSX.Element} - The HomePage component.
 */
function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const navCards = document.querySelectorAll('.nav-card');
    if (navCards.length % 2 !== 0) {
      navCards[navCards.length - 1].classList.add('odd-last-child');
    }
  }, []);

  return (
    <>
      <Layout
        headerProps={{
          searchTerm: '',
          onSearchChange: () => {},
          searchResults: [],
          onSearchResultClick: () => {},
          hideSearch: true,
        }}
      >
        <div className="home-page">
          <div className="home-content">
            <div className="home-content-header">
              <h1>The Digital Landscape of ONS</h1>
              <p>
                Explore and analyse technology trends across the organisation
              </p>
            </div>

            <div className="navigation-cards">
              {homePageNavigationItems.map(item => {
                const cardContent = (
                  <>
                    <div className="nav-card-header">
                      <item.icon />
                      <h2>{item.label}</h2>
                    </div>
                    <p>{item.description}</p>
                  </>
                );

                return item.homeUseAnchor ? (
                  <a key={item.path} className="nav-card" href={item.path}>
                    {cardContent}
                  </a>
                ) : (
                  <div
                    key={item.path}
                    className="nav-card"
                    onClick={() => navigate(item.path)}
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>

            <RecentBanners />
            <BugReport />
            <Changelog />
          </div>
        </div>
      </Layout>
    </>
  );
}

export default HomePage;
