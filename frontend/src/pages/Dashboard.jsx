import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  Globe,
  Server,
  Wifi,
  Lock,
  Radio,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import "./Dashboard.css";

const API_URL = " https://cloud-based-honeypot-threat-monitoring.onrender.com";

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={22} />
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function RiskBadge({ severity }) {
  const value = severity || "LOW";

  return (
    <span className={`risk-badge ${value.toLowerCase()}`}>
      {value}
    </span>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dashboard`);

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      setDashboard(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to Flask backend. Make sure python app.py is running."
      );
    }
  };

  if (error && !dashboard) {
    return (
      <div className="dashboard-page">
        <div className="connection-error">
          <ShieldAlert size={50} />
          <h2>Backend Offline</h2>
          <p>{error}</p>

          <code>python app.py</code>
        </div>
      </div>
    );
  }

  const stats = dashboard?.statistics || {};
  const events = dashboard?.recent_events || [];
  const alerts = dashboard?.recent_alerts || [];

  const chartData = events
    .slice()
    .reverse()
    .map((event, index) => ({
      name: `${index + 1}`,
      attacks: index + 1,
    }));

  return (
    <div className="dashboard-page">

      {/* Header */}

      <div className="dashboard-header">
        <div>
          <div className="page-label">
            SECURITY OPERATIONS CENTER
          </div>

          <h1>Threat Monitoring Dashboard</h1>

          <p>
            Real-time monitoring of simulated honeypot activity
          </p>
        </div>

        <div className="live-indicator">
          <span></span>
          SYSTEM LIVE
        </div>
      </div>


      {/* Stats */}

      <div className="stats-grid">

        <StatCard
          title="Total Events"
          value={stats.total_events || 0}
          subtitle="Captured activity"
          icon={Activity}
        />

        <StatCard
          title="Critical Alerts"
          value={stats.high_severity || 0}
          subtitle="High severity"
          icon={AlertTriangle}
        />

        <StatCard
          title="Unique Sources"
          value={stats.unique_ips || 0}
          subtitle="Source IPs"
          icon={Globe}
        />

        <StatCard
          title="Port Scans"
          value={stats.port_scans || 0}
          subtitle="Detected scans"
          icon={Wifi}
        />

      </div>


      {/* Main grid */}

      <div className="dashboard-grid">

        {/* Attack Activity */}

        <div className="panel attack-chart">

          <div className="panel-header">

            <div>
              <h3>Attack Activity</h3>
              <span>Recent captured events</span>
            </div>

            <Activity size={20} />

          </div>

          <div className="chart-container">

            {chartData.length > 0 ? (

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#263241"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#718096"
                  />

                  <YAxis
                    stroke="#718096"
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      border: "1px solid #263241",
                      borderRadius: "8px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="attacks"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="empty-state">
                <Activity size={32} />
                <p>No attack activity yet</p>
              </div>

            )}

          </div>

        </div>


        {/* Honeypot status */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>Honeypot Services</h3>
              <span>Monitored endpoints</span>
            </div>

            <Server size={20} />

          </div>

          <div className="service-list">

            <div className="service-item">

              <div className="service-icon">
                <Globe size={18} />
              </div>

              <div>
                <strong>HTTP Honeypot</strong>
                <small>Port 8080</small>
              </div>

              <span className="online">
                ONLINE
              </span>

            </div>


            <div className="service-item">

              <div className="service-icon">
                <Lock size={18} />
              </div>

              <div>
                <strong>SSH Honeypot</strong>
                <small>Port 2222</small>
              </div>

              <span className="online">
                ONLINE
              </span>

            </div>


            <div className="service-item">

              <div className="service-icon">
                <Radio size={18} />
              </div>

              <div>
                <strong>FTP Honeypot</strong>
                <small>Port 2121</small>
              </div>

              <span className="online">
                ONLINE
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* Recent Events */}

      <div className="panel events-panel">

        <div className="panel-header">

          <div>
            <h3>Recent Threat Events</h3>
            <span>Latest captured activity</span>
          </div>

          <span className="event-count">
            {events.length} EVENTS
          </span>

        </div>


        {events.length === 0 ? (

          <div className="empty-state">
            <ShieldAlert size={32} />
            <p>No events captured yet</p>
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>TIME</th>
                  <th>SOURCE IP</th>
                  <th>SERVICE</th>
                  <th>CATEGORY</th>
                  <th>EVENT</th>
                  <th>RISK</th>
                </tr>

              </thead>

              <tbody>

                {events.map((event) => (

                  <tr key={event.id}>

                    <td>
                      {event.timestamp
                        ? new Date(
                            event.timestamp
                          ).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="ip">
                      {event.source_ip}
                    </td>

                    <td>
                      <span className="service-tag">
                        {event.service}
                      </span>
                    </td>

                    <td>
                      {event.category}
                    </td>

                    <td>
                      {event.event_type}
                    </td>

                    <td>
                      <RiskBadge
                        severity={event.severity}
                      />
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* Alerts */}

      <div className="panel alerts-panel">

        <div className="panel-header">

          <div>
            <h3>Security Alerts</h3>
            <span>High-priority detections</span>
          </div>

          <AlertTriangle size={20} />

        </div>


        {alerts.length === 0 ? (

          <div className="no-alerts">
            <ShieldAlert size={28} />
            <span>No active high-severity alerts</span>
          </div>

        ) : (

          <div className="alert-list">

            {alerts.slice(0, 5).map((alert) => (

              <div
                className="alert-item"
                key={alert.id}
              >

                <AlertTriangle size={18} />

                <div>

                  <strong>
                    {alert.category}
                  </strong>

                  <p>
                    {alert.message}
                  </p>

                  <small>
                    {alert.source_ip} •{" "}
                    {alert.service}
                  </small>

                </div>

                <RiskBadge
                  severity={alert.severity}
                />

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Dashboard;