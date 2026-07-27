import React from 'react';

const SelectableEntityReport = ({
  searchId,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  resultCap,
  totalAccessible,
  selectedItems,
  filteredItems,
  onClearSelection,
  onToggleSelection,
  emptyStateMessage,
  generateButtonLabel,
  singularLabel,
  pluralLabel,
}) => (
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

    <p className="policy-reports-hint policy-reports-space-top-xs">
      Showing first {resultCap} matches from up to {totalAccessible}{' '}
      {pluralLabel}.
    </p>

    <div className="policy-reports-selection-summary policy-reports-space-top-xs">
      <span className="policy-reports-hint">
        {selectedItems.length}{' '}
        {selectedItems.length === 1 ? singularLabel : pluralLabel} selected
      </span>
      <button
        className="policy-reports-btn"
        type="button"
        onClick={onClearSelection}
      >
        Clear selection
      </button>
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
              className="policy-reports-btn"
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

    {selectedItems.length > 0 && (
      <div className="policy-reports-chip-list policy-reports-space-top-sm">
        {selectedItems.map(item => (
          <span key={item} className="policy-reports-selection-chip">
            {item}
          </span>
        ))}
      </div>
    )}

    <div className="policy-reports-auth-row policy-reports-actions-row">
      <button
        className="policy-reports-btn policy-reports-btn-primary"
        type="button"
      >
        {generateButtonLabel}
      </button>
    </div>
  </>
);

export default SelectableEntityReport;
