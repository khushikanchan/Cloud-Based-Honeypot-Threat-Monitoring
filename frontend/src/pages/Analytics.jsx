import { useEffect, useState } from "react";

import {
  BarChart3,
  RefreshCw,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";


const API_URL =  "https://cloud-based-honeypot-threat-monitoring.onrender.com";


function Analytics() {

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ======================================================
  // LOAD EVENTS
  // ======================================================

  const loadEvents = async () => {

    try {

      setError("");

      const response = await fetch(
        `${API_URL}/api/events?limit=500`
      );

      if (!response.ok) {
        throw new Error(
          "Events API unavailable"
        );
      }

      const data = await response.json();

      console.log(
        "Analytics events:",
        data
      );

      setEvents(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Analytics error:",
        err
      );

      setError(
        "Unable to load analytics data."
      );

      setEvents([]);

    } finally {

      setLoading(false);

    }

  };


  // ======================================================
  // INITIAL LOAD + AUTO REFRESH
  // ======================================================

  useEffect(() => {

    loadEvents();

    const interval = setInterval(
      loadEvents,
      5000
    );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ======================================================
  // SERVICE DATA
  // ======================================================

  const serviceData = [

    {
      name: "HTTP",
      value: events.filter(
        event =>
          String(event.service || "")
            .toUpperCase() === "HTTP"
      ).length,
    },

    {
      name: "SSH",
      value: events.filter(
        event =>
          String(event.service || "")
            .toUpperCase() === "SSH"
      ).length,
    },

    {
      name: "FTP",
      value: events.filter(
        event =>
          String(event.service || "")
            .toUpperCase() === "FTP"
      ).length,
    },

  ];


  // ======================================================
  // SEVERITY DATA
  // ======================================================

  const severityData = [

    {
      name: "LOW",
      value: events.filter(
        event =>
          String(event.severity || "")
            .toUpperCase() === "LOW"
      ).length,
    },

    {
      name: "MEDIUM",
      value: events.filter(
        event =>
          String(event.severity || "")
            .toUpperCase() === "MEDIUM"
      ).length,
    },

    {
      name: "HIGH",
      value: events.filter(
        event =>
          String(event.severity || "")
            .toUpperCase() === "HIGH"
      ).length,
    },

  ];


  // ======================================================
  // CATEGORY DATA
  // ======================================================

  const categoryMap = {

    "Reconnaissance":
      "Reconnaissance",

    "Credential Attack":
      "Credential Attack",

    "Web Attack":
      "Web Attack",

    "Port Scan":
      "Port Scan",

    "Suspicious Connection":
      "Suspicious Connection",

    "Unknown":
      "Unknown",

  };


  const categoryData = Object.keys(
    categoryMap
  ).map(category => {

    const count = events.filter(
      event =>
        String(event.category || "")
          .toLowerCase() ===
        category.toLowerCase()
    ).length;

    return {
      name: category,
      value: count,
    };

  });


  // ======================================================
  // ATTACKS PER HOUR
  // ======================================================

  const hourlyMap = {};


  events.forEach(event => {

    if (!event.timestamp) {
      return;
    }


    const date = new Date(
      event.timestamp
    );


    if (isNaN(date.getTime())) {
      return;
    }


    const hour =
      String(
        date.getHours()
      ).padStart(2, "0") + ":00";


    if (!hourlyMap[hour]) {
      hourlyMap[hour] = 0;
    }


    hourlyMap[hour]++;

  });


  const hourlyData = Object.keys(
    hourlyMap
  )
    .sort()
    .map(hour => ({

      hour,

      count:
        hourlyMap[hour],

    }));


  // ======================================================
  // TOTAL EVENTS
  // ======================================================

  const totalEvents =
    events.length;


  // ======================================================
  // HIGH RISK EVENTS
  // ======================================================

  const highRisk =
    events.filter(
      event =>
        String(event.severity || "")
          .toUpperCase() === "HIGH"
    ).length;


  // ======================================================
  // UNIQUE SOURCE IPs
  // ======================================================

  const uniqueSources =
    new Set(
      events
        .map(event => event.source_ip)
        .filter(Boolean)
    ).size;


  // ======================================================
  // PORT SCANS
  // ======================================================

  const portScans =
    events.filter(
      event =>
        String(event.category || "")
          .toLowerCase() ===
        "port scan"
    ).length;


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (

      <div className="module-page">

        <div className="module-header">

          <div className="module-icon">

            <BarChart3 size={28} />

          </div>

          <div>

            <div className="page-label">
              SECURITY ANALYTICS
            </div>

            <h1>
              Security Analytics
            </h1>

            <p>
              Loading real honeypot activity...
            </p>

          </div>

        </div>

      </div>

    );

  }


  // ======================================================
  // ERROR
  // ======================================================

  if (error) {

    return (

      <div className="module-page">

        <div className="module-header">

          <div className="module-icon">

            <BarChart3 size={28} />

          </div>

          <div>

            <div className="page-label">
              SECURITY ANALYTICS
            </div>

            <h1>
              Security Analytics
            </h1>

            <p>
              {error}
            </p>

          </div>

        </div>


        <div className="module-panel">

          <h2>
            Backend connection failed
          </h2>

          <p>
            Make sure Flask is running on
            localhost:5000.
          </p>

          <button
            className="refresh-button"
            onClick={loadEvents}
          >

            <RefreshCw size={15} />

            Retry

          </button>

        </div>

      </div>

    );

  }


  // ======================================================
  // MAIN ANALYTICS PAGE
  // ======================================================

  return (

    <div className="module-page">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="module-header">

        <div className="module-icon">

          <BarChart3 size={28} />

        </div>


        <div>

          <div className="page-label">
            SECURITY OPERATIONS ANALYTICS
          </div>

          <h1>
            Security Analytics
          </h1>

          <p>
            Visual analysis of honeypot
            activity and detected threats.
          </p>

        </div>

      </div>


      {/* ==================================================
          LIVE BAR
      ================================================== */}

      <div className="live-monitor-bar">

        <div className="live-status">

          <span className="pulse-dot"></span>

          ANALYTICS LIVE

        </div>


        <button
          className="refresh-button"
          onClick={loadEvents}
        >

          <RefreshCw size={15} />

          Refresh

        </button>

      </div>


      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div
        className="analytics-summary-grid"
      >

        <div className="analytics-summary-card">

          <span>
            TOTAL EVENTS
          </span>

          <strong>
            {totalEvents}
          </strong>

        </div>


        <div className="analytics-summary-card">

          <span>
            HIGH RISK
          </span>

          <strong>
            {highRisk}
          </strong>

        </div>


        <div className="analytics-summary-card">

          <span>
            UNIQUE SOURCES
          </span>

          <strong>
            {uniqueSources}
          </strong>

        </div>


        <div className="analytics-summary-card">

          <span>
            PORT SCANS
          </span>

          <strong>
            {portScans}
          </strong>

        </div>

      </div>


      {/* ==================================================
          CHART GRID
      ================================================== */}

      <div className="analytics-grid">


        {/* ==================================================
            ATTACK ACTIVITY
        ================================================== */}

        <div className="chart-panel large">

          <div className="chart-title">

            <div>

              <h3>
                Attack Activity
              </h3>

              <span>
                Attacks detected over time
              </span>

            </div>


            <Activity size={19} />

          </div>


          <div className="chart-container">

            {hourlyData.length === 0 ? (

              <div className="empty-chart">

                No event activity detected yet.

              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={hourlyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="hour"
                    stroke="#64748b"
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#64748b"
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "#0f172a",
                      border:
                        "1px solid #1e293b",
                      borderRadius:
                        "8px",
                      color:
                        "#ffffff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>


        {/* ==================================================
            BY SERVICE
        ================================================== */}

        <div className="chart-panel">

          <div className="chart-title">

            <div>

              <h3>
                By Service
              </h3>

              <span>
                Honeypot activity
              </span>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={serviceData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                />

                <YAxis
                  allowDecimals={false}
                  stroke="#64748b"
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#38bdf8"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* ==================================================
            SEVERITY
        ================================================== */}

        <div className="chart-panel">

          <div className="chart-title">

            <div>

              <h3>
                Severity Distribution
              </h3>

              <span>
                Risk levels
              </span>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >

                  {severityData.map(
                    (entry, index) => (

                      <Cell
                        key={
                          entry.name
                        }
                        fill={
                          [
                            "#22c55e",
                            "#f59e0b",
                            "#ef4444",
                          ][index]
                        }
                      />

                    )
                  )}

                </Pie>


                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* ==================================================
            ATTACK CATEGORIES
        ================================================== */}

        <div className="chart-panel large">

          <div className="chart-title">

            <div>

              <h3>
                Attack Categories
              </h3>

              <span>
                Classification of detected
                activity
              </span>

            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={categoryData}
                layout="vertical"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  stroke="#64748b"
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  width={120}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#38bdf8"
                  radius={[
                    0,
                    5,
                    5,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


      </div>


      {/* ==================================================
          DATA STATUS
      ================================================== */}

      <div className="analytics-data-status">

        <span className="pulse-dot"></span>

        Monitoring {events.length} captured
        event{events.length === 1 ? "" : "s"}

      </div>

    </div>

  );

}


export default Analytics;