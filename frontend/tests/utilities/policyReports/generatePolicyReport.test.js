import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePolicyReport } from '../../../src/utilities/policyReports/generatePolicyReport';

vi.mock('../../../src/utilities/customFetch', () => ({
  default: vi.fn(),
}));

import customFetch from '../../../src/utilities/customFetch';

describe('generatePolicyReport', () => {
  let appendChildSpy;
  let removeChildSpy;
  let clickSpy;
  let createObjectURLSpy;
  let revokeObjectURLSpy;
  let createElementSpy;
  let mockLink;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLink = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
    clickSpy = mockLink.click;

    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockLink);
    appendChildSpy = vi
      .spyOn(document.body, 'append')
      .mockImplementation(() => {});

    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/fake-url');
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('posts to the report API with the correct payload', async () => {
    const blob = new Blob(['<html/>'], { type: 'text/html' });
    const headers = new Headers({ 'Content-Disposition': 'attachment; filename="report.html"' });
    customFetch.mockResolvedValue({ blob: async () => blob, headers });

    await generatePolicyReport({
      reportType: 'Organisation',
      inputs: { organisation: 'ONS-Innovation', sourceDataset: 'ds1', comparisonDataset: 'ds0' },
    });

    expect(customFetch).toHaveBeenCalledWith('/policy-reports/api/generateReport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        reportType: 'Organisation',
        inputs: { organisation: 'ONS-Innovation', sourceDataset: 'ds1', comparisonDataset: 'ds0' },
      }),
    });
  });

  it('creates an object URL from the response blob and triggers a download', async () => {
    const blob = new Blob(['<html/>'], { type: 'text/html' });
    const headers = new Headers({ 'Content-Disposition': 'attachment; filename="my-report.html"' });
    customFetch.mockResolvedValue({ blob: async () => blob, headers });

    await generatePolicyReport({ reportType: 'Repository', inputs: {} });

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(mockLink.href).toBe('blob:http://localhost/fake-url');
    expect(mockLink.download).toBe('my-report.html');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('falls back to "policy-report.html" when Content-Disposition header is absent', async () => {
    const blob = new Blob(['<html/>'], { type: 'text/html' });
    const headers = new Headers();
    customFetch.mockResolvedValue({ blob: async () => blob, headers });

    await generatePolicyReport({ reportType: 'Team', inputs: {} });

    expect(mockLink.download).toBe('policy-report.html');
  });

  it('revokes the object URL after triggering the download', async () => {
    const blob = new Blob(['<html/>'], { type: 'text/html' });
    const headers = new Headers({ 'Content-Disposition': 'attachment; filename="r.html"' });
    customFetch.mockResolvedValue({ blob: async () => blob, headers });

    await generatePolicyReport({ reportType: 'Organisation', inputs: {} });

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/fake-url');
  });

  it('propagates errors thrown by customFetch', async () => {
    customFetch.mockRejectedValue(new Error('Server error'));

    await expect(
      generatePolicyReport({ reportType: 'Organisation', inputs: {} })
    ).rejects.toThrow('Server error');
  });
});
