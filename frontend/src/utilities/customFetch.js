import toast from 'react-hot-toast';
import ErrorToast from '../components/Toast/ErrorToast';

const extractErrorMessage = async response => {
  const contentType = response.headers.get('Content-Type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return data?.error || data?.message || '';
    }

    const text = await response.text();

    if (!text) {
      return '';
    }

    try {
      const data = JSON.parse(text);
      return data?.error || data?.message || text;
    } catch (_) {
      return text;
    }
  } catch (_) {
    return '';
  }
};

const customFetch = async (url, options) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const response = await fetch(backendUrl + url, options);

  if (!response.ok) {
    const extractedErrorMessage = await extractErrorMessage(response);
    const errorMessage =
      extractedErrorMessage || `Request failed with status ${response.status}`;

    toast.custom(t => <ErrorToast t={t} error={errorMessage} />, {
      duration: 10000,
    });

    // Re-throw the error to be caught by the calling function if needed
    throw new Error(errorMessage);
  }

  return response;
};

export default customFetch;
