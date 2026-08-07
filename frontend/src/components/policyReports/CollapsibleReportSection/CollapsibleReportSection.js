import React from 'react';

const CollapsibleReportSection = ({ title, className = '', children }) => {
  const collapsibleClassName = `policy-reports-collapsible ${className}`.trim();

  return (
    <details className={collapsibleClassName}>
      <summary className="policy-reports-collapsible-summary">
        {title}
        <span className="policy-reports-collapsible-hint policy-reports-collapsible-hint-expand">
          [Click to expand]
        </span>
        <span className="policy-reports-collapsible-hint policy-reports-collapsible-hint-collapse">
          [Click to collapse]
        </span>
      </summary>
      <div className="policy-reports-collapsible-content">{children}</div>
    </details>
  );
};

export default CollapsibleReportSection;
