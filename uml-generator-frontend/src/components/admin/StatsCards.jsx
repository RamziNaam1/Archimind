export default function StatsCards({ stats }) {
  const statsList = [
    { label: "Total Users", value: stats?.totalUsers || "0", isHighlight: true },
    { label: "Active Users", value: stats?.activeUsers || "0" },
    { label: "Deactivated Users", value: stats?.inactiveUsers || "0" },
    { label: "Admin Users", value: stats?.adminUsers || "0" },
  ]

  return (
    <div className="admin-stats-grid">
      {statsList.map((stat, i) => (
        <div key={i} className={`admin-stat-card glass-panel ${stat.isHighlight ? 'highlight' : ''}`}>
          <p className="admin-stat-label">{stat.label}</p>
          <p className="admin-stat-value">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
