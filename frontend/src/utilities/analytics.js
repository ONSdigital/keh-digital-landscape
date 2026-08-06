const RESERVED_ATTRIBUTE_NAMES = new Set([
  'data-ga',
  'data-ga-event',
  'data-ga-min-length',
  'data-ga-value-key',
  'data-ga-text-key',
]);

const INPUT_TRACKING_DELAY_MS = 700;

const inputTimers = new WeakMap();
const lastInputSignatures = new WeakMap();
const trackedVisibleElements = new WeakSet();

export let trackEvent = () => false;

const sanitizeParameters = parameters => {
  return Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return true;
    })
  );
};

trackEvent = (eventName, parameters = {}) => {
  if (
    typeof window === 'undefined' ||
    typeof window.gtag !== 'function' ||
    typeof eventName !== 'string' ||
    eventName.trim().length === 0
  ) {
    return false;
  }

  const sanitizedParameters = sanitizeParameters({
    ...parameters,
    page_path: window.location.pathname,
  });

  window.gtag('event', eventName, sanitizedParameters);
  return true;
};

const getTrackedAttributes = element => {
  const eventData = {};

  for (const attribute of Array.from(element.attributes)) {
    if (
      !attribute.name.startsWith('data-ga-') ||
      RESERVED_ATTRIBUTE_NAMES.has(attribute.name)
    ) {
      continue;
    }

    const key = attribute.name.replace('data-ga-', '').replace(/-/g, '_');
    eventData[key] = attribute.value;
  }

  const valueKey = element.getAttribute('data-ga-value-key');
  if (valueKey) {
    eventData[valueKey] = element.value;
  }

  const textKey = element.getAttribute('data-ga-text-key');
  if (textKey && element instanceof HTMLSelectElement) {
    eventData[textKey] =
      element.selectedOptions[0]?.textContent?.trim() || element.value;
  }

  return eventData;
};

export const trackElement = (element, fallbackType) => {
  if (!element) {
    return false;
  }

  const eventName =
    element.getAttribute('data-ga-event') || `ons_${fallbackType}`;

  return trackEvent(eventName, getTrackedAttributes(element));
};

const getClosestTrackedElement = (target, type) => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest(`[data-ga="${type}"]`);
};

const handleInputTracking = element => {
  const value = element.value?.trim() || '';
  const minLength = Number(element.getAttribute('data-ga-min-length') || '0');

  if (inputTimers.has(element)) {
    window.clearTimeout(inputTimers.get(element));
  }

  if (value.length < minLength) {
    return;
  }

  const timeoutId = window.setTimeout(() => {
    const eventName =
      element.getAttribute('data-ga-event') || 'ga_input';
    const eventData = getTrackedAttributes(element);
    const signature = JSON.stringify({ eventName, eventData });

    if (lastInputSignatures.get(element) === signature) {
      return;
    }

    lastInputSignatures.set(element, signature);
    trackEvent(eventName, eventData);
  }, INPUT_TRACKING_DELAY_MS);

  inputTimers.set(element, timeoutId);
};

const trackVisibleElements = () => {
  const elements = document.querySelectorAll('[data-ga="visible"]');

  elements.forEach(element => {
    if (trackedVisibleElements.has(element)) {
      return;
    }

    trackedVisibleElements.add(element);
    trackElement(element, 'visible');
  });
};

export default function initAnalytics() {
  document.body.addEventListener('click', event => {
    const element = getClosestTrackedElement(event.target, 'click');
    if (element) {
      trackElement(element, 'click');
    }
  });

  document.body.addEventListener('change', event => {
    const element = getClosestTrackedElement(event.target, 'change');
    if (element) {
      trackElement(element, 'change');
    }
  });

  document.body.addEventListener('submit', event => {
    const element = getClosestTrackedElement(event.target, 'submit');
    if (element) {
      trackElement(element, 'submit');
    }
  });

  document.body.addEventListener('input', event => {
    const element = getClosestTrackedElement(event.target, 'input');
    if (element) {
      handleInputTracking(element);
    }
  });

  const observer = new MutationObserver(() => {
    trackVisibleElements();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  trackVisibleElements();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics, { once: true });
} else {
  initAnalytics();
}