import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, variant = 'default', trend = null }) => {
  return (
    <div className={`metric-card ${variant}`}>
      <div className="metric-header">
        <span>{title}</span>
        {Icon && <Icon size={20} style={{ opacity: 0.8 }} />}
      </div>
      <div className="metric-value">{value}</div>
      {(subtitle || trend) && (
        <div className="metric-sub">
          {trend && <span style={{ fontWeight: 600 }}>{trend}</span>}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
