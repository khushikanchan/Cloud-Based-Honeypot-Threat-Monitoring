import { useEffect, useState } from "react";
import {
  Globe,
  ShieldAlert,
  RefreshCw,
  Search,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function RiskScore({ score }) {

  let level = "LOW";

  if (score > 70) {
    level = "HIGH";
  } else if (score > 30) {
    level = "MEDIUM";
  }

  return (
    <div className="score-container">

      <div className="score-number">
        {score ?? 0}
      </div>

      <span
        className={`risk-badge ${level.toLowerCase()}`}
      >
        {level}
      </span>

    </div>
  );
}

function ThreatIntelligence() {

  const [ips, setIps] = useState([]);
  const [search, setSearch] = useState("");

  const loadIntelligence = async () => {

    try {

      const response = await fetch(
        `${API_URL}/api/threat-intelligence`
      );

      if (!response.ok) {
        throw new Error(
          "Threat intelligence API unavailable"
        );
      }

      const data = await response.json();

      setIps(data);

    } catch (error) {

      console.error(
        "Threat intelligence error:",
        error
      );

    }
  };


  useEffect(() => {

    loadIntelligence();

    const interval = setInterval(
      loadIntelligence,
      5000
    );

    return () => clearInterval(interval);

  }, []);


  const filteredIPs = ips.filter((item) =>
    String(item.source_ip || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  return (
    <div className="module-page">

      {/* Header */}

      <div className="module-header">

        <div className="module-icon">
          <Globe size={28} />
        </div>

        <div>

          <div className="page-label">
            THREAT INTELLIGENCE
          </div>

          <h1>Threat Intelligence</h1>

          <p>
            Monitor source IP activity and calculated
            threat risk.
          </p>

        </div>

      </div>


      {/* Toolbar */}

      <div className="event-toolbar">

        <div className="search-box">

          <Search size={17} />

          <input
            placeholder="Search source IP..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <button
          className="refresh-button"
          onClick={loadIntelligence}
        >
          <RefreshCw size={15} />
          Refresh
        </button>

      </div>


      {/* Intelligence table */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h3>
              Source IP Intelligence
            </h3>

            <span>
              {filteredIPs.length} tracked source IPs
            </span>

          </div>

          <ShieldAlert size={20} />

        </div>


        {filteredIPs.length === 0 ? (

          <div className="empty-state">

            <Globe size={35} />

            <p>
              No source IP intelligence available
            </p>

            <small>
              Generate honeypot activity to populate
              this table.
            </small>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>IP ADDRESS</th>

                  <th>COUNTRY</th>

                  <th>FIRST SEEN</th>

                  <th>LAST SEEN</th>

                  <th>ATTACK COUNT</th>

                  <th>RISK SCORE</th>

                </tr>

              </thead>


              <tbody>

                {filteredIPs.map(
                  (item) => (

                    <tr
                      key={item.source_ip}
                    >

                      <td className="ip">
                        {item.source_ip}
                      </td>

                      <td>
                        {item.country || "Unknown"}
                      </td>

                      <td>
                        {item.first_seen
                          ? new Date(
                              item.first_seen
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {item.last_seen
                          ? new Date(
                              item.last_seen
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        <strong>
                          {item.attack_count || 0}
                        </strong>
                      </td>

                      <td>
                        <RiskScore
                          score={
                            item.risk_score || 0
                          }
                        />
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ThreatIntelligence;