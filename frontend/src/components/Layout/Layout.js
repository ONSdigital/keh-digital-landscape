import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';
import { Toaster } from 'react-hot-toast';
import { BannerContainer } from '../Banner';

const Layout = ({ children, headerProps = {}, bannerProps = {} }) => {
  return (
    <div className="layout">
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--background))',
            opacity: '1',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius)',
            textAlign: 'left',
            padding: '10px 16px',
            boxSizing: 'border-box',
            boxShadow:
              '0 3px 10px hsl(var(--foreground) / .05), 0 3px 3px hsl(var(--foreground) / .01)',
          },
        }}
      />{' '}
      <Header {...headerProps} />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          {bannerProps?.page ? <BannerContainer {...bannerProps} /> : null}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
