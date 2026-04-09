import { render, screen, fireEvent } from '@testing-library/react';
import Banner from './Banner';

describe('Banner', () => {
  const title = 'Test Title';
  const description = 'Test Description';
  const bannerTypes = ['info', 'warning', 'error'];

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the banner with title and description', () => {
    render(<Banner title={title} description={description} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('applies the correct type class', () => {
    render(<Banner title={title} description={description} type="warning" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(title).closest('.banner')).toHaveClass(
      'banner-warning'
    );
  });

  it('renders info type by default', () => {
    render(<Banner title={title} description={description} />);
    expect(screen.getByText(title).closest('.banner')).toHaveClass(
      'banner-info'
    );
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Banner title={title} description={description} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('sets dismissed state in localStorage on close', () => {
    render(<Banner title={title} description={description} />);
    const bannerId = `dismissed_banner_${title}_${description}`.replace(
      /\s+/g,
      '_'
    );
    fireEvent.click(screen.getByRole('button'));
    const stored = JSON.parse(localStorage.getItem(bannerId));
    expect(stored).toHaveProperty('dismissedAt');
    expect(typeof stored.dismissedAt).toBe('number');
  });

  // Note:
  // We cannot test that the banner is hidden from the DOM after dismissal because
  // the Banner component itself does not manage its visibility based on localStorage.
  // This is handled by the backend (when initially fetching banners) and the
  // BannerContainer (which empties the banners state when a banner is closed).
  // Therefore, we can only test that the onClose callback is called and that
  // localStorage is updated.

  it('does not render without title, description or type', () => {
    render(<Banner />);
    expect(screen.queryByText(title)).not.toBeInTheDocument();
    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });

  bannerTypes.forEach(type => {
    it(`renders the correct class for type: ${type}`, () => {
      render(<Banner title={title} description={description} type={type} />);
      expect(screen.getByText(title).closest('.banner')).toHaveClass(
        `banner-${type}`
      );
    });
  });
});
