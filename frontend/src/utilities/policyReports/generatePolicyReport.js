import customFetch from '../customFetch';

export const generatePolicyReport = async ({ reportType, inputs }) => {
  const response = await customFetch('/policy-reports/api/generateReport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reportType, inputs }),
  });

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);

  const disposition = response.headers.get('Content-Disposition');
  const fileName =
    disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'policy-report.html';

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
};
