import React from 'react';

const SelectableEntityReport = ({
  searchId,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  resultsPerPage,
  onResultsPerPageChange,
  pageSizeOptions,
  totalAccessible,
  totalMatching,
  selectedItems,
  filteredItems,
  onClearSelection,
  onToggleSelection,
  emptyStateMessage,
  generateButtonLabel,
  generateButtonInProgressLabel,
  onGenerateReport,
  isGenerating,
  isGenerateDisabled,
  singularLabel,
  pluralLabel,
}) => {
  const isSelectionRequired = selectedItems.length === 0;
  const resultsPerPageControlId = `${searchId}-results-per-page`;
  const availablePageSizes =
    pageSizeOptions && pageSizeOptions.length > 0
      ? pageSizeOptions
      : [10, 25, 50, 100];

  return (
    <>
      <div className="policy-reports-field policy-reports-space-top-xs">
        <label htmlFor={searchId}>{searchLabel}</label>
        <input
          id={searchId}
          className="policy-reports-text-input"
          type="text"
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          value={searchValue}
          onChange={event => onSearchChange(event.target.value)}
        />
      </div>

      <div className="policy-reports-selection-summary policy-reports-space-top-xs">
        <span className="policy-reports-hint policy-reports-selection-summary-selected">
          {selectedItems.length}{' '}
          {selectedItems.length === 1 ? singularLabel : pluralLabel} selected
        </span>
        <span className="policy-reports-hint policy-reports-selection-summary-showing">
          Showing {filteredItems.length} of {totalMatching} matching{' '}
          {pluralLabel} ({totalAccessible} available).
        </span>
      </div>

      <div className="policy-reports-resource-list policy-reports-space-top-sm">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <article
              key={item}
              className="policy-reports-resource-item policy-reports-resource-item-action"
            >
              <strong>{item}</strong>
              <button
                className="policy-reports-btn policy-reports-btn-compact"
                type="button"
                onClick={() => onToggleSelection(item)}
              >
                {selectedItems.includes(item) ? 'Remove' : 'Add'}
              </button>
            </article>
          ))
        ) : (
          <p className="policy-reports-hint policy-reports-no-margin">
            {emptyStateMessage}
          </p>
        )}
      </div>

      <div className="policy-reports-pagination-row policy-reports-space-top-sm">
        <div className="policy-reports-pagination">
          <button
            className="policy-reports-btn policy-reports-btn-compact"
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            &lsaquo; Prev
          </button>
          <span className="policy-reports-pagination-label">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="policy-reports-btn policy-reports-btn-compact"
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next &rsaquo;
          </button>
        </div>

        <div className="policy-reports-page-size-controls">
          <label
            className="policy-reports-hint"
            htmlFor={resultsPerPageControlId}
          >
            Results per page
          </label>
          <select
            id={resultsPerPageControlId}
            className="policy-reports-select-input policy-reports-page-size-select"
            value={resultsPerPage}
            onChange={event =>
              onResultsPerPageChange(Number(event.target.value))
            }
          >
            {availablePageSizes.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="policy-reports-chip-list policy-reports-space-top-sm">
          {selectedItems.map(item => (
            <span key={item} className="policy-reports-selection-chip">
              <span>{item}</span>
              <button
                className="policy-reports-chip-remove"
                type="button"
                onClick={() => onToggleSelection(item)}
                aria-label={`Remove ${singularLabel} ${item}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="policy-reports-auth-row policy-reports-actions-row">
        <div className="policy-reports-primary-actions">
          <div className="policy-reports-generate-row">
            <button
              className="policy-reports-btn policy-reports-btn-primary"
              type="button"
              onClick={onGenerateReport}
              disabled={isGenerateDisabled}
            >
              {isGenerating
                ? generateButtonInProgressLabel || 'Generating report...'
                : generateButtonLabel}
            </button>
            {isSelectionRequired && (
              <span className="policy-reports-generation-warning" role="alert">
                Select at least one {singularLabel} to generate this report.
              </span>
            )}
          </div>
          <button
            className="policy-reports-btn policy-reports-btn-compact"
            type="button"
            onClick={onClearSelection}
          >
            Clear selection
          </button>
        </div>
        {isGenerating && (
          <span className="policy-reports-generation-status" role="status">
            <span
              className="policy-reports-inline-spinner"
              aria-hidden="true"
            />
            Generating placeholder report...
          </span>
        )}
      </div>
    </>
  );
};

export default SelectableEntityReport;
