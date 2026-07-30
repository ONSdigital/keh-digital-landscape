import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  buildReportFooterHtml,
  buildReportHeaderHtml,
} = require('./reportFrameTemplate');

describe('reportFrameTemplate', () => {
  it('escapes all user-provided strings in header and footer output', () => {
    const headerHtml = buildReportHeaderHtml({
      heading: 'Org <Report>',
      description: 'Desc "quoted" & info',
      metadataItems: [
        { label: 'Organisation <name>', value: 'ONS & Partners' },
      ],
    });

    const footerHtml = buildReportFooterHtml({
      generatedAt: '2026-07-30T12:00:00Z<script>',
      debugLines: ['Source: <dataset-id>'],
    });

    expect(headerHtml).toContain('Org &lt;Report&gt;');
    expect(headerHtml).toContain('Desc &quot;quoted&quot; &amp; info');
    expect(headerHtml).toContain('Organisation &lt;name&gt;');
    expect(headerHtml).toContain('ONS &amp; Partners');

    expect(footerHtml).toContain('2026-07-30T12:00:00Z&lt;script&gt;');
    expect(footerHtml).toContain('Source: &lt;dataset-id&gt;');
    expect(footerHtml).not.toContain('<script>');
  });
});
