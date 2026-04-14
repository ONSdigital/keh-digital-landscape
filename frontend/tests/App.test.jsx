import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';

// Mock DataContext to prevent actual data fetching
vi.mock('../src/contexts/DataContext', () => ({
  DataProvider: ({ children }) => children,
  useData: () => ({ data: {}, loading: false, error: null }),
}));

// Mock ProtectedRoute to always render children
vi.mock('../src/components/ProtectedRoute/ProtectedRoute', () => ({
  default: ({ children }) => children,
}));

// Mock components that cause user profile fetch & banners
vi.mock('../src/components/UserProfile/UserProfile', () => ({
  default: () => null,
}));
vi.mock('../src/components/HomePage/RecentBanners', () => ({
  default: () => null,
}));

// Mock userService to prevent actual API calls
vi.mock(
  '../src/services/userService',
  () => ({
    getUserData: vi.fn().mockResolvedValue({ name: 'Test User' }),
  }),
  { virtual: true }
);

// Mock getDirectorates to prevent fetch during module-level await
vi.mock('../src/utilities/getDirectorates', () => ({
  getDirectorates: vi
    .fn()
    .mockResolvedValue([
      { id: 0, name: 'Test', colour: '#000', default: true, enabled: true },
    ]),
}));

import App from '../src/App';

describe('App', () => {
  it('renders the Home page', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      );
    });
    expect(
      await screen.findByText(/Home/i, {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Restricted/i, {}, { timeout: 3000 })
    ).toBeInTheDocument();
  });

  it('shows the "Report a Bug" link and can be clicked to the Report Bug information', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      );
    });
    const reportBugLink = await screen.findByText(
      /Report a bug/i,
      {},
      { timeout: 3000 }
    );
    await act(() => {
      userEvent.click(reportBugLink);
    });
    expect(
      await screen.findByText(
        /You will be redirected to GitHub/i,
        {},
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
  });
});
