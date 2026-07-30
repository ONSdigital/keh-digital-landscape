import { describe, expect, it } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { generateHtmlDocument } = require('./generateHtmlDocument');

describe('policyReportGenerator/functions/generateHtmlDocument', () => {
  it('creates an html document with inline css and escaped metadata', () => {
    const html = generateHtmlDocument({
      title: '<Policy Report>',
      description: 'A "quoted" description',
      body: '    <main>Body content</main>',
    });

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<style>');
    expect(html).toContain('--background: 0 0% 100%');
    expect(html).toContain('<title>&lt;Policy Report&gt;</title>');
    expect(html).toContain('A &quot;quoted&quot; description');
    expect(html).toContain('<main>Body content</main>');
  });
});
