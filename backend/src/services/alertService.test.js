import { afterEach, describe, expect, it, vi } from 'vitest';

// Must set env before requiring the module so TOKEN_URL and WEBHOOK_URL are defined
process.env.AZURE_TENANT_ID = 'test-tenant';
process.env.AZURE_CLIENT_ID = 'test-client';
process.env.AZURE_CLIENT_SECRET = 'test-secret';
process.env.WEBHOOK_SCOPE = 'test-scope';
process.env.WEBHOOK_URL = 'https://webhook.example.com/post';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const postToWebhook = require('./alertService');

describe('alertService – postToWebhook', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts a message to the webhook and returns the response text', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'tok-abc' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Message sent',
      });
    vi.stubGlobal('fetch', fetchMock);

    const result = await postToWebhook({ message: 'Hello' });

    expect(result).toBe('Message sent');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // First call: token endpoint
    const [tokenUrl, tokenOpts] = fetchMock.mock.calls[0];
    expect(tokenUrl).toContain('oauth2/v2.0/token');
    expect(tokenOpts.method).toBe('POST');

    // Second call: webhook
    const [webhookUrl, webhookOpts] = fetchMock.mock.calls[1];
    expect(webhookUrl).toBe('https://webhook.example.com/post');
    expect(webhookOpts.headers.Authorization).toBe('Bearer tok-abc');
    expect(JSON.parse(webhookOpts.body)).toEqual({ message: 'Hello' });
  });

  it('throws when the token request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error_description: 'Invalid client credentials',
        }),
      })
    );

    await expect(postToWebhook({ message: 'Hello' })).rejects.toThrow(
      'Invalid client credentials'
    );
  });

  it('throws when the token response has no access_token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}), // no access_token
      })
    );

    await expect(postToWebhook({ message: 'Hello' })).rejects.toThrow(
      'Failed to get access token'
    );
  });

  it('throws when the webhook returns a non-ok response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'tok-abc' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => 'Webhook error',
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(postToWebhook({ message: 'Hello' })).rejects.toThrow(
      'Webhook error'
    );
  });
});
