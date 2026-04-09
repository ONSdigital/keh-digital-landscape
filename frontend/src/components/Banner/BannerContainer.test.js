import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BannerContainer from './BannerContainer';
import React from 'react';

const { mockSendAlert } = vi.hoisted(() => ({
  mockSendAlert: vi.fn(),
}));

// Mock Banner component
vi.mock('./Banner', () => ({
  __esModule: true,
  default: ({ title, description, type, onClose }) => (
    <div data-testid="banner">
      <span>{title}</span>
      <span>{description}</span>
      <span>{type}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock useData context
const mockGetPageBanners = vi.fn();
vi.mock('../../contexts/dataContext', () => ({
  useData: () => ({
    getPageBanners: mockGetPageBanners,
  }),
}));

// Mock sendAlert function
vi.mock('../Alerts/Alerts', () => ({
  __esModule: true,
  default: mockSendAlert,
  sendAlert: mockSendAlert,
  sendLog: vi.fn(),
}));

describe('BannerContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing while loading', async () => {
    mockGetPageBanners.mockReturnValue(new Promise(() => {}));
    render(<BannerContainer page="radar" />);
    expect(screen.queryByTestId('banner')).toBeNull();
  });

  it('renders nothing if no banners are returned', async () => {
    mockGetPageBanners.mockResolvedValue([]);
    render(<BannerContainer page="radar" />);
    await waitFor(() => {
      expect(screen.queryByTestId('banner')).toBeNull();
    });
  });

  it('renders banner when getPageBanners returns a single banner', async () => {
    const banners = [
      { title: 'Test Banner', description: 'Desc', type: 'info' },
    ];
    mockGetPageBanners.mockResolvedValue(banners);
    render(<BannerContainer page="radar" />);
    await waitFor(() => {
      expect(screen.getAllByTestId('banner')).toHaveLength(1);
      expect(screen.getByText('Test Banner')).toBeInTheDocument();
    });
  });

  it('renders only the first banner and calls sendAlert if multiple banners are returned', async () => {
    const banners = [
      { title: 'Banner 1', description: 'Desc 1', type: 'info' },
      { title: 'Banner 2', description: 'Desc 2', type: 'warning' },
    ];
    mockGetPageBanners.mockResolvedValue(banners);
    render(<BannerContainer page="radar" />);
    await waitFor(() => {
      expect(screen.getAllByTestId('banner')).toHaveLength(1);
      expect(screen.getByText('Banner 1')).toBeInTheDocument();
      expect(mockSendAlert).toHaveBeenCalledWith(
        `Warning: Multiple banners for page "radar"`,
        `Received 2 banners from backend for page "radar"`,
        `This should never happen. Please investigate the backend filtering logic (See BannerContainer.js).`
      );
    });
  });

  it('removes banners when onClose is clicked', async () => {
    const banners = [
      { title: 'Closable Banner', description: 'Desc', type: 'info' },
    ];
    mockGetPageBanners.mockResolvedValue(banners);
    render(<BannerContainer page="radar" />);
    await waitFor(() => {
      expect(screen.getByText('Closable Banner')).toBeInTheDocument();
    });
    screen.getByText('Close').click();
    await waitFor(() => {
      expect(screen.queryByText('Closable Banner')).toBeNull();
    });
  });

  it('does not fetch banners if page prop is not provided', () => {
    render(<BannerContainer />);
    expect(mockGetPageBanners).not.toHaveBeenCalled();
  });

  it('logs error if getPageBanners throws', async () => {
    mockGetPageBanners.mockRejectedValue(new Error('fail'));
    render(<BannerContainer page="radar" />);
    await waitFor(() => {
      expect(mockSendAlert).toHaveBeenCalledWith(
        'Error fetching banners for page "radar"',
        'fail',
        'Error raised from BannerContainer.js while fetching banners for page "radar". Please investigate the issue.'
      );
    });
  });
});
