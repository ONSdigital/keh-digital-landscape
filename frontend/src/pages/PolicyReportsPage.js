import React, { useState } from 'react';
import PageBanner from '../components/PageBanner/PageBanner';
import Layout from '../components/Layout/Layout';

const PolicyReportsPage = () => {
  return (
    <div>
      <Layout
        headerProps={{ hideSearch: true }}
        bannerProps={{ page: 'policyreports' }}
      >
        <PageBanner
          title="Policy Reports"
          description="Generate and view reports on GitHub Usage Policy compliance."
          tabs={[]}
        />
      </Layout>
    </div>
  );
};

export default PolicyReportsPage;
