import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import SelectableEntityReport from './SelectableEntityReport';

const buildProps = overrides => ({
  searchId: 'repository-search',
  searchLabel: 'Search repositories',
  searchPlaceholder: 'Type to filter repositories',
  searchValue: '',
  onSearchChange: vi.fn(),
  resultsPerPage: 25,
  onResultsPerPageChange: vi.fn(),
  pageSizeOptions: [10, 25, 50],
  totalAccessible: 2,
  totalMatching: 2,
  selectedItems: ['repo-alpha'],
  filteredItems: ['repo-alpha', 'repo-beta'],
  onClearSelection: vi.fn(),
  onToggleSelection: vi.fn(),
  currentPage: 1,
  totalPages: 1,
  onPageChange: vi.fn(),
  emptyStateMessage: 'No repositories match your search.',
  generateButtonLabel: 'Generate Repository Report',
  generateButtonInProgressLabel: 'Generating Repository Report...',
  onGenerateReport: vi.fn(),
  isGenerating: false,
  isGenerateDisabled: false,
  singularLabel: 'repository',
  pluralLabel: 'repositories',
  ...overrides,
});

describe('SelectableEntityReport', () => {
  it('allows deselecting from a selection chip', async () => {
    const onToggleSelection = vi.fn();

    render(
      <SelectableEntityReport
        {...buildProps({
          selectedItems: ['repo-alpha'],
          filteredItems: ['repo-alpha'],
          onToggleSelection,
        })}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove repository repo-alpha' })
    );

    expect(onToggleSelection).toHaveBeenCalledWith('repo-alpha');
  });

  it('uses compact styling for add and remove selection actions', () => {
    render(
      <SelectableEntityReport
        {...buildProps({
          selectedItems: ['repo-alpha'],
          filteredItems: ['repo-alpha', 'repo-beta'],
        })}
      />
    );

    expect(screen.getByRole('button', { name: 'Remove' })).toHaveClass(
      'policy-reports-btn-compact'
    );
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass(
      'policy-reports-btn-compact'
    );
  });

  it('shows a repository visibility label for structured items', () => {
    render(
      <SelectableEntityReport
        {...buildProps({
          selectedItems: [],
          filteredItems: [{ name: 'repo-alpha', visibility: 'internal' }],
        })}
      />
    );

    expect(screen.getByText('internal')).toBeInTheDocument();
  });

  it('always renders pagination controls even on the first page', () => {
    render(
      <SelectableEntityReport
        {...buildProps({ currentPage: 1, totalPages: 1 })}
      />
    );

    const prevBtn = screen.getByRole('button', { name: /prev/i });
    const nextBtn = screen.getByRole('button', { name: /next/i });

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('calls onPageChange with decremented page when Prev is clicked', async () => {
    const onPageChange = vi.fn();

    render(
      <SelectableEntityReport
        {...buildProps({ currentPage: 2, totalPages: 3, onPageChange })}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /prev/i }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with incremented page when Next is clicked', async () => {
    const onPageChange = vi.fn();

    render(
      <SelectableEntityReport
        {...buildProps({ currentPage: 1, totalPages: 3, onPageChange })}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables Next button on the last page', () => {
    render(
      <SelectableEntityReport
        {...buildProps({ currentPage: 3, totalPages: 3 })}
      />
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /prev/i })).not.toBeDisabled();
  });

  it('calls onResultsPerPageChange when a new page size is selected', async () => {
    const onResultsPerPageChange = vi.fn();

    render(
      <SelectableEntityReport
        {...buildProps({
          resultsPerPage: 25,
          pageSizeOptions: [10, 25, 50],
          onResultsPerPageChange,
        })}
      />
    );

    const select = screen.getByLabelText(/results per page/i);
    await userEvent.selectOptions(select, '50');

    expect(onResultsPerPageChange).toHaveBeenCalledWith(50);
  });

  it('renders the results-per-page dropdown with the provided options', () => {
    render(
      <SelectableEntityReport
        {...buildProps({ pageSizeOptions: [10, 25, 50] })}
      />
    );

    const select = screen.getByLabelText(/results per page/i);
    const options = Array.from(select.options).map(o => Number(o.value));

    expect(options).toEqual([10, 25, 50]);
  });

  it('renders Clear selection below Generate report button', () => {
    const { container } = render(<SelectableEntityReport {...buildProps()} />);

    const generateBtn = screen.getByRole('button', {
      name: /generate repository report/i,
    });
    const clearBtn = screen.getByRole('button', { name: /clear selection/i });
    const allButtons = Array.from(container.querySelectorAll('button'));
    const generateIndex = allButtons.indexOf(generateBtn);
    const clearIndex = allButtons.indexOf(clearBtn);

    expect(clearIndex).toBeGreaterThan(generateIndex);
  });

  it('renders the selection-required warning inline with the generate button area', () => {
    render(
      <SelectableEntityReport
        {...buildProps({ selectedItems: [], isGenerateDisabled: true })}
      />
    );

    const warning = screen.getByRole('alert');
    const generateBtn = screen.getByRole('button', {
      name: /generate repository report/i,
    });

    // Both should be inside the same generate-row container
    expect(warning.closest('.policy-reports-generate-row')).toBe(
      generateBtn.closest('.policy-reports-generate-row')
    );
  });
});
