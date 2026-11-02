import { useEffect, useState } from "react";
import {
  Zap,
  AlertTriangle,
  Activity,
  RefreshCw,
} from "lucide-react";

const API_URL = " https://cloud-based-honeypot-threat-monitoring.onrender.com";

function RiskBadge({ severity }) {
  const value = severity || "LOW";

  return (
    <span className={`risk-badge ${value.toLowerCase()}`}>
      {value}
    </span>
  );
}

function LiveThreats() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadEvents = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/events?limit=50`
      );

      if (!response.ok) {
        throw new Error("Unable to load events");
      }

      const data = await response.json();

      setEvents(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Live threat error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    const interval = setInterval(
      loadEvents,
      2000
    );

    return () => clearInterval(interval);
  }, []);

  const highThreats = events.filter(
    (event) => event.severity === "HIGH"
  ).length;

  const mediumThreats = events.filter(
    (event) => event.severity === "MEDIUM"
  ).length;

  const recentEvents = events.slice(0, 15);

  return (
    <div className="module-page">

      {/* Header */}

      <div className="module-header">

        <div className="module-icon">
          <Zap size={28} />
        </div>

        <div>
          <div className="page-label">
            REAL-TIME MONITORING
          </div>

          <h1>Live Threats</h1>

          <p>
            Monitor suspicious activity detected by
            the honeypot services.
          </p>
        </div>

      </div>


      {/* Status */}

      <div className="live-monitor-bar">

        <div className="live-status">
          <span className="pulse-dot"></span>
          LIVE MONITORING
        </div>

        <div className="refresh-info">
          <RefreshCw size={14} />

          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : "Connecting..."}
        </div>

      </div>


      {/* Threat statistics */}

      <div className="module-stats">

        <div className="module-stat">

          <Activity size={22} />

          <div>
            <small>TOTAL EVENTS</small>
            <strong>{events.length}</strong>
          </div>

        </div>


        <div className="module-stat high-stat">

          <AlertTriangle size={22} />

          <div>
            <small>HIGH SEVERITY</small>
            <strong>{highThreats}</strong>
          </div>

        </div>


        <div className="module-stat medium-stat">

          <AlertTriangle size={22} />

          <div>
            <small>MEDIUM SEVERITY</small>
            <strong>{mediumThreats}</strong>
          </div>

        </div>

      </div>


      {/* Events */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h3>Live Security Events</h3>

            <span>
              Automatically refreshed every 2 seconds
            </span>
          </div>

          <div className="live-badge">
            ● LIVE
          </div>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading security events...
          </div>

        ) : recentEvents.length === 0 ? (

          <div className="empty-state">
            <Activity size={35} />

            <p>
              No security events detected
            </p>
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>TIME</th>
                  <th>SOURCE IP</th>
                  <th>SERVICE</th>
                  <th>PORT</th>
                  <th>CATEGORY</th>
                  <th>EVENT</th>
                  <th>RISK</th>
                  <th>SCORE</th>
                </tr>
              </thead>

              <tbody>

                {recentEvents.map((event) => (

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
                      {event.destination_port}
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

                    <td>
                      <strong className="risk-number">
                        {event.risk_score}
                      </strong>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default LiveThreats;