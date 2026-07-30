import { toast } from 'react-hot-toast';
import customFetch from '../customFetch';

export const fetchPolicyReportOrganisationOptions = async () => {
  try {
    const response = await customFetch('/policy-reports/api/organisations');

    const data = await response.json();
    return data;
  } catch (error) {
    toast.error('Error loading policy report organisations.');
    return null;
  }
};
