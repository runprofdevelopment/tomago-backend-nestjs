const getConfig = require('../../../config');

module.exports = class DynalinksService {
  static buildPath(pathPrefix) {
    return `${pathPrefix}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  static _getDynalinksConfig() {
    const fromConfig = getConfig().dynalinks || {};
    return {
      apiKey: process.env.DYNALINKS_API_KEY || fromConfig.apiKey,
      apiUrl:
        process.env.DYNALINKS_API_URL ||
        fromConfig.apiUrl ||
        'https://dynalinks.app/api/v1/links',
      subdomain:
        process.env.DYNALINKS_SUBDOMAIN || fromConfig.subdomain || 'tomago',
      iosAppId: process.env.DYNALINKS_IOS_APP_ID || fromConfig.iosAppId,
      androidAppId:
        process.env.DYNALINKS_ANDROID_APP_ID || fromConfig.androidAppId,
    };
  }

  /**
   * Creates a Dynalink via the REST API. Returns the public Dynalinks URL, or
   * `options.url` when Dynalinks is not configured or the request fails.
   *
   * Public URL format: https://{subdomain}.dynalinks.app/{path}
   */
  static async createLink(options) {
    const dynalinks = this._getDynalinksConfig();
    const apiKey = dynalinks.apiKey;
    const apiUrl = dynalinks.apiUrl || 'https://dynalinks.app/api/v1/links';

    if (!apiKey) {
      console.warn('Dynalinks API key not configured. Using destination URL.');
      return options.url;
    }

    try {
      const body = JSON.stringify(this._buildRequestBody(options, dynalinks));
      // Console examples use Bearer; docs also mention Token {api_key}.
      let response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body,
      });

      if (response.status === 401) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${apiKey}`,
          },
          body,
        });
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.warn(
          `Dynalinks API error (${response.status}): ${errorText}. Using destination URL.`,
        );
        return options.url;
      }

      const data = await response.json();
      const publicLink = this._buildPublicLink(data, dynalinks, options.url);

      if (!publicLink) {
        console.warn(
          'Dynalinks API response did not include a usable path. Using destination URL.',
          data,
        );
        return options.url;
      }

      console.log('Dynalink created successfully:', publicLink);
      return publicLink;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Failed to create Dynalink (${detail}). Using destination URL.`);
      return options.url;
    }
  }

  static _buildRequestBody(options, dynalinks) {
    const iosAppId = this._resolveDynalinksAppId(dynalinks.iosAppId, 'iOS');
    const androidAppId = this._resolveDynalinksAppId(
      dynalinks.androidAppId,
      'Android',
    );
    const iosFallbackUrl = options.iosFallbackUrl || options.url;
    const androidFallbackUrl = options.androidFallbackUrl || options.url;

    const body = {
      name: options.name,
      path: options.path,
      url: options.url,
      ios_fallback_url: iosFallbackUrl,
      android_fallback_url: androidFallbackUrl,
      enable_forced_redirect: options.enableForcedRedirect ?? true,
    };

    if (options.deepLinkValue) {
      body.deep_link_value = options.deepLinkValue;
    }

    if (iosAppId) {
      body.ios_app = { id: iosAppId };
    }

    if (androidAppId) {
      body.android_app = { id: androidAppId };
    }

    if (options.iosDeferredDeepLinkingEnabled) {
      body.ios_deferred_deep_linking_enabled = true;
    }

    return body;
  }

  /**
   * Dynalinks expects its own console UUID app IDs, not Firebase app IDs
   * (e.g. `1:123:android:abc`). Firebase-style values are ignored.
   */
  static _resolveDynalinksAppId(value, platformLabel) {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) {
      return undefined;
    }

    if (/^\d+:\d+:(android|ios|web):/i.test(trimmed)) {
      console.warn(
        `DYNALINKS_${platformLabel.toUpperCase()}_APP_ID looks like a Firebase app ID ("${trimmed}"). ` +
          `Dynalinks needs the UUID from Dynalinks Console → ${platformLabel} Apps. ` +
          `Omitting ${platformLabel} app from the request.`,
      );
      return undefined;
    }

    return trimmed;
  }

  /**
   * Build https://{subdomain}.dynalinks.app/{path|shortened_path}
   * The create API returns destination in `url`, not the public Dynalink.
   */
  static _buildPublicLink(data, dynalinks, destinationUrl) {
    if (!data) {
      return undefined;
    }

    if (typeof data.shortLink === 'string' && data.shortLink !== destinationUrl) {
      return data.shortLink;
    }
    if (typeof data.dynalink === 'string' && data.dynalink !== destinationUrl) {
      return data.dynalink;
    }
    if (typeof data.link === 'string' && data.link !== destinationUrl) {
      return data.link;
    }

    const subdomain = (dynalinks.subdomain || 'tomago').replace(/^https?:\/\//, '').replace(/\.dynalinks\.app$/i, '').replace(/\/$/, '');
    const path =
      (typeof data.shortened_path === 'string' && data.shortened_path) ||
      (typeof data.path === 'string' && data.path) ||
      null;

    if (!path) {
      return undefined;
    }

    return `https://${subdomain}.dynalinks.app/${path.replace(/^\//, '')}`;
  }
};
