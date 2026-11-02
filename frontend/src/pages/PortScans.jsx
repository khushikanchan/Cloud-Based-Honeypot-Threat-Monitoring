import { useEffect, useState } from "react";
import {
  ScanSearch,
  RefreshCw,
  ShieldAlert,
  Radio,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function RiskBadge({ severity }) {
  const value = severity || "HIGH";

  return (
    <span className={`risk-badge ${value.toLowerCase()}`}>
      {value}
    </span>
  );
}

function PortScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadScans = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/port-scans`
      );

      if (!response.ok) {
        throw new Error("Port scan API unavailable");
      }

      const data = await response.json();

      setScans(data);
    } catch (error) {
      console.error("Port scan error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();

    const interval = setInterval(
      loadScans,
      3000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="module-page">

      {/* Header */}

      <div className="module-header">

        <div className="module-icon">
          <ScanSearch size={28} />
        </div>

        <div>
          <div className="page-label">
            NETWORK RECONNAISSANCE
          </div>

          <h1>Port Scan Detection</h1>

          <p>
            Monitor multi-port reconnaissance activity
            across honeypot services.
          </p>
        </div>

      </div>


      {/* Status */}

      <div className="live-monitor-bar">

        <div className="live-status">
          <span className="pulse-dot"></span>
          PORT MONITORING ACTIVE
        </div>

        <div className="refresh-info">
          <RefreshCw size={14} />
          Auto refresh: 3 seconds
        </div>

      </div>


      {/* Stats */}

      <div className="module-stats">

        <div className="module-stat">

          <ScanSearch size={22} />

          <div>
            <small>DETECTED SCANS</small>
            <strong>{scans.length}</strong>
          </div>

        </div>


        <div className="module-stat high-stat">

          <ShieldAlert size={22} />

          <div>
            <small>HIGH RISK SCANS</small>

            <strong>
              {
                scans.filter(
                  (scan) =>
                    scan.severity === "HIGH"
                ).length
              }
            </strong>

          </div>

        </div>


        <div className="module-stat">

          <Radio size={22} />

          <div>
            <small>UNIQUE SOURCES</small>

            <strong>
              {
                new Set(
                  scans.map(
                    (scan) =>
                      scan.source_ip
                  )
                ).size
              }
            </strong>

          </div>

        </div>

      </div>


      {/* Table */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h3>Detected Port Scans</h3>

            <span>
              Multiple honeypot ports contacted
              by the same source
            </span>
          </div>

          <button
            className="refresh-button"
            onClick={loadScans}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

        </div>


        {loading ? (

          <div className="empty-state">
            Loading port scan data...
          </div>

        ) : scans.length === 0 ? (

          <div className="empty-state">

            <ScanSearch size={40} />

            <h3>
              No Port Scans Detected
            </h3>

            <p>
              Multi-port reconnaissance activity
              will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>TIME</th>
                  <th>SOURCE IP</th>
                  <th>PORTS CONTACTED</th>
                  <th>PORT COUNT</th>
                  <th>RISK SCORE</th>
                  <th>SEVERITY</th>
                </tr>

              </thead>


              <tbody>

                {scans.map((scan) => (

                  <tr key={scan.id}>

                    <td>
                      {scan.detected_at
                        ? new Date(
                            scan.detected_at
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="ip">
                      {scan.source_ip}
                    </td>

                    <td>

                      <div className="port-list">

                        {String(
                          scan.ports || ""
                        )
                          .split(",")
                          .map(
                            (port) => (
                              <span
                                key={port}
                                className="port-chip"
                              >
                                {port.trim()}
                              </span>
                            )
                          )}

                      </div>

                    </td>

                    <td>
                      <strong>
                        {scan.port_count}
                      </strong>
                    </td>

                    <td>
                      <strong className="risk-number">
                        {scan.risk_score}
                      </strong>
                    </td>

                    <td>
                      <RiskBadge
                        severity={
                          scan.severity
                        }
                      />
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

export default PortScans;