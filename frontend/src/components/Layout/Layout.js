import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../../styles/Layout.css';
import { Toaster } from 'react-hot-toast';
import { BannerContainer } from '../Banner';

const Layout = ({ children, headerProps = {}, bannerProps = {} }) => {
  const [bannerOffset, setBannerOffset] = useState(0);

  useEffect(() => {
    if (!bannerProps?.page) {
      setBannerOffset(0);
      return;
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    let resizeObserver;
    let mutationObserver;
    let observedElement = null;
    let rafId;

    const ResizeObserverImpl = window.ResizeObserver;
    const MutationObserverImpl = window.MutationObserver;

    const attachResizeObserver = element => {
      if (element === observedElement) return;
      if (resizeObserver && observedElement) {
        try {
          resizeObserver.unobserve(observedElement);
        } catch {
          // ignore
        }
      }

      observedElement = element;
      if (!observedElement) return;

      if (typeof ResizeObserverImpl !== 'undefined') {
        if (!resizeObserver) {
          resizeObserver = new ResizeObserverImpl(() => update());
        }
        resizeObserver.observe(observedElement);
      }
    };

    const update = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const element = document.querySelector('.banner-fixed');
        attachResizeObserver(element);

        const nextOffset = element
          ? Math.ceil(element.getBoundingClientRect().height)
          : 0;

        setBannerOffset(prev => (prev === nextOffset ? prev : nextOffset));
      });
    };

    update();
    window.addEventListener('resize', update);

    if (typeof MutationObserverImpl !== 'undefined') {
      mutationObserver = new MutationObserverImpl(update);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      window.removeEventListener('resize', update);
      if (mutationObserver) mutationObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [bannerProps?.page]);

  return (
    <div className="layout" style={{ '--banner-offset': `${bannerOffset}px` }}>
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
