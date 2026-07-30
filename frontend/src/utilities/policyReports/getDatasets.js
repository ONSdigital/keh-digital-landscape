import { toast } from 'react-hot-toast';
import customFetch from '../customFetch';

export const fetchDatasetsByOrganisation = async organisation => {
  try {
    const response = await customFetch(
      `/policy-reports/api/datasets?organisation=${encodeURIComponent(organisation)}`
    );

    const data = await response.json();
    return data.datasets || [];
  } catch (error) {
    toast.error('Error loading datasets for the selected organisation.');
    return [];
  }
};
