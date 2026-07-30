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
  resultCap: 25,
  totalAccessible: 2,
  totalMatching: 2,
  selectedItems: ['repo-alpha'],
  filteredItems: ['repo-alpha', 'repo-beta'],
  onClearSelection: vi.fn(),
  onToggleSelection: vi.fn(),
  onLoadMore: vi.fn(),
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
});
