import React, { useState } from 'react';
import Header from '../components/Header/Header';
import BannerManage from '../components/Admin/BannerManage';
import TechManage from '../components/Admin/TechManage';
import '../styles/ReviewPage.css';
import '../styles/AdminPage.css';
import PageBanner from '../components/PageBanner/PageBanner';
import Layout from '../components/Layout/Layout';

/**
 * Admin page for managing system-wide settings like banners
 */
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('banner');

  const tabs = [
    { id: 'banner', label: 'Banner Management' },
    { id: 'tech', label: 'Technology Management' },
  ];

  return (
    <>
      <Layout headerProps={{ hideSearch: true }}>
        <div className="admin-page">
          <PageBanner
            title="Admin Dashboard"
            description="Manage system-wide settings and configurations"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div
          className={`admin-content ${activeTab === 'banner' ? 'active' : ''}`}
        >
          <BannerManage />
        </div>
        <div
          className={`admin-content ${activeTab === 'tech' ? 'active' : ''}`}
        >
          <TechManage />
        </div>
      </Layout>
    </>
  );
};

export default AdminPage;
