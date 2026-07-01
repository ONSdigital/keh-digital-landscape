import { getPercentage } from '../../../utilities/getPercentage';

function Card({ title, numerator, denominator }) {
  const ratio = denominator > 0 ? numerator / denominator : 0;
  const percentage = getPercentage(ratio);
  const description = `${numerator} out of ${denominator} active users this month`;

  return (
    <div className="usage-card">
      <h3 className="usage-card-title">{title}</h3>
      <div className="usage-card-body">
        <p className="usage-card-percentage">{percentage}</p>
        <p className="usage-card-description">{description}</p>
      </div>
      <div className="usage-card-bar">
        <div
          className="usage-card-bar-fill"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function GeneralUsageDashboard({ data, isLoading }) {
  return (
    <div className="copilot-dashboard">
      <h2>User Adoption</h2>
      <div className="usage-cards-grid">
        {isLoading ? (
          <>
            <div className="usage-card skeleton" />
            <div className="usage-card skeleton" />
          </>
        ) : (
          <>
            <Card
              title="Chat Users"
              numerator={data.chatUsers.count}
              denominator={data.chatUsers.total}
            />
            <Card
              title="Agent Adoption"
              numerator={data.agentAdoption.count}
              denominator={data.agentAdoption.total}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default GeneralUsageDashboard;