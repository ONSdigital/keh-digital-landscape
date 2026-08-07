import customFetch from './customFetch';

/**
 * Fetches the list of directorates from the backend API.
 * @returns {Promise<Array>} A promise that resolves to an array of directorates.
 */
export const getDirectorates = async () => {
  try {
    const response = await customFetch('/api/directorates/json');

    const data = await response.json();

    // Ensure data is an array
    if (!Array.isArray(data)) {
      throw new Error('Directorates data is not an array');
    }

    // Ensure that there is at least one directorate
    if (data.length === 0) {
      throw new Error('Directorates data is empty');
    }

    // Ensure that each directorate has the required fields
    data.forEach(directorate => {
      if (
        typeof directorate.id !== 'number' ||
        typeof directorate.name !== 'string' ||
        typeof directorate.colour !== 'string' ||
        typeof directorate.default !== 'boolean' ||
        typeof directorate.enabled !== 'boolean'
      ) {
        throw new Error(
          'Directorate object is missing required fields or has incorrect types'
        );
      }
    });

    // Filter out directorates where enabled is false
    const enabledDirectorates = data.filter(directorate => directorate.enabled);

    return enabledDirectorates;
  } catch (error) {
    // customFetch already showed the error toast; just return the fallback
    // If there's an error, default to Digital Services
    return [
      {
        id: 0,
        name: 'Digital Services (DS)',
        colour: '#1f77b4',
        default: true,
        enabled: true,
      },
    ];
  }
};
