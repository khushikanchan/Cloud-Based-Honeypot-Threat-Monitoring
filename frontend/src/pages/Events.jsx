import { useEffect, useState } from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  Radio,
  AlertTriangle,
  Shield,
  Zap,
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

function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [service, setService] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/events?limit=200`
      );

      if (!response.ok) {
        throw new Error("Events API unavailable");
      }

      const data = await response.json();

      setEvents(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Events error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    const interval = setInterval(() => {
      loadEvents();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchText = `
      ${event.source_ip || ""}
      ${event.category || ""}
      ${event.event_type || ""}
      ${event.details || ""}
      ${event.service || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesSeverity =
      severity === "ALL" ||
      event.severity === severity;

    const matchesService =
      service === "ALL" ||
      event.service === service;

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesService
    );
  });

  const totalEvents = events.length;

  const highRisk = events.filter(
    (event) => event.severity === "HIGH"
  ).length;

  const mediumRisk = events.filter(
    (event) => event.severity === "MEDIUM"
  ).length;

  const lowRisk = events.filter(
    (event) => event.severity === "LOW"
  ).length;

  return (
    <div className="events-page">

      {/* ================= HEADER ================= */}

      <div className="events-header">

        <div className="events-title-section">

          <div className="events-title-icon">
            <Activity size={28} />
          </div>

          <div>
            <div className="events-page-label">
              SECURITY EVENT LOG
            </div>

            <h1>Security Events</h1>

            <p>
              Real-time security activity captured by
              the honeypot infrastructure.
            </p>
          </div>

        </div>

        <div className="events-live-status">
          <span className="live-dot"></span>
          <span>LIVE MONITORING</span>
        </div>

      </div>


      {/* ================= LIVE MONITORING ================= */}

      <div className="live-monitor-card">

        <div className="live-monitor-left">

          <div className="live-icon">
            <Radio size={20} />
          </div>

          <div>
            <h3>Live Event Monitoring</h3>

            <p>
              Automatically checking for new security events
            </p>
          </div>

        </div>

        <div className="live-monitor-right">

          <span className="live-dot"></span>

          <span>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Connecting..."}
          </span>

          <span className="refresh-info">
            Auto-refresh: 5s
          </span>

        </div>

      </div>


      {/* ================= STATISTICS ================= */}

      <div className="event-stat-grid">

        <div className="event-stat-card">

          <div className="event-stat-icon blue">
            <Activity size={22} />
          </div>

          <div className="event-stat-content">
            <span>TOTAL EVENTS</span>
            <strong>{totalEvents}</strong>
            <small>Captured activity</small>
          </div>

        </div>


        <div className="event-stat-card">

          <div className="event-stat-icon red">
            <AlertTriangle size={22} />
          </div>

          <div className="event-stat-content">
            <span>HIGH RISK</span>
            <strong>{highRisk}</strong>
            <small>High severity events</small>
          </div>

        </div>


        <div className="event-stat-card">

          <div className="event-stat-icon orange">
            <Zap size={22} />
          </div>

          <div className="event-stat-content">
            <span>MEDIUM RISK</span>
            <strong>{mediumRisk}</strong>
            <small>Medium severity events</small>
          </div>

        </div>


        <div className="event-stat-card">

          <div className="event-stat-icon green">
            <Shield size={22} />
          </div>

          <div className="event-stat-content">
            <span>LOW RISK</span>
            <strong>{lowRisk}</strong>
            <small>Low severity events</small>
          </div>

        </div>

      </div>


      {/* ================= FILTER TOOLBAR ================= */}

      <div className="events-toolbar">

        <div className="events-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search IP, category, event..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <div className="events-filter">

          <Filter size={16} />

          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
          >

            <option value="ALL">
              All Severity
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

          </select>

        </div>


        <div className="events-filter">

          <select
            value={service}
            onChange={(e) =>
              setService(e.target.value)
            }
          >

            <option value="ALL">
              All Services
            </option>

            <option value="HTTP">
              HTTP
            </option>

            <option value="SSH">
              SSH
            </option>

            <option value="FTP">
              FTP
            </option>

          </select>

        </div>


        <button
          className="events-refresh-button"
          onClick={loadEvents}
          disabled={loading}
        >

          <RefreshCw
            size={16}
            className={
              loading ? "refresh-spinning" : ""
            }
          />

          {loading ? "Loading..." : "Refresh"}

        </button>

      </div>


      {/* ================= EVENT TABLE ================= */}

      <div className="events-panel">

        <div className="events-panel-header">

          <div>

            <h2>Event Log</h2>

            <p>
              Showing{" "}
              <strong>
                {filteredEvents.length}
              </strong>{" "}
              of{" "}
              <strong>
                {events.length}
              </strong>{" "}
              events
            </p>

          </div>

          <div className="table-live-indicator">

            <span className="live-dot"></span>

            LIVE

          </div>

        </div>


        {filteredEvents.length === 0 ? (

          <div className="events-empty">

            <Activity size={42} />

            <h3>No Security Events</h3>

            <p>
              No events match your current filters.
            </p>

          </div>

        ) : (

          <div className="events-table-wrapper">

            <table className="events-table">

              <thead>

                <tr>

                  <th>ID</th>
                  <th>TIME</th>
                  <th>SOURCE IP</th>
                  <th>SOURCE PORT</th>
                  <th>SERVICE</th>
                  <th>DEST. PORT</th>
                  <th>EVENT</th>
                  <th>CATEGORY</th>
                  <th>SEVERITY</th>
                  <th>SCORE</th>

                </tr>

              </thead>


              <tbody>

                {filteredEvents.map((event) => (

                  <tr key={event.id}>

                    <td>
                      <span className="event-id">
                        #{event.id}
                      </span>
                    </td>


                    <td className="event-time">

                      {event.timestamp
                        ? new Date(
                            event.timestamp
                          ).toLocaleString()
                        : "-"}

                    </td>


                    <td>

                      <span className="event-ip">
                        {event.source_ip || "-"}
                      </span>

                    </td>


                    <td>
                      {event.source_port || "-"}
                    </td>


                    <td>

                      <span
                        className={`service-tag ${
                          event.service
                            ? event.service.toLowerCase()
                            : ""
                        }`}
                      >
                        {event.service || "-"}
                      </span>

                    </td>


                    <td>
                      {event.destination_port || "-"}
                    </td>


                    <td>
                      {event.event_type || "-"}
                    </td>


                    <td>
                      {event.category || "-"}
                    </td>


                    <td>

                      <RiskBadge
                        severity={event.severity}
                      />

                    </td>


                    <td>

                      <span className="risk-score">
                        {event.risk_score ?? 0}
                      </span>

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

export default Events;