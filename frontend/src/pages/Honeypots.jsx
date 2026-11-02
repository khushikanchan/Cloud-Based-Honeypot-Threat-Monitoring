import {
  Server,
  Globe,
  LockKeyhole,
  Radio,
  Activity,
} from "lucide-react";

function ServiceCard({
  name,
  protocol,
  port,
  icon: Icon,
  description,
}) {

  return (

    <div className="honeypot-card">

      <div className="honeypot-top">

        <div className="honeypot-icon">
          <Icon size={25} />
        </div>

        <span className="online-badge">
          ● ONLINE
        </span>

      </div>


      <h2>
        {name}
      </h2>


      <p>
        {description}
      </p>


      <div className="honeypot-details">

        <div>
          <small>PROTOCOL</small>
          <strong>{protocol}</strong>
        </div>

        <div>
          <small>PORT</small>
          <strong>{port}</strong>
        </div>

      </div>


      <div className="honeypot-status">

        <span className="status-dot"></span>

        Simulated service active

      </div>

    </div>

  );
}


function Honeypots() {

  return (

    <div className="module-page">

      {/* Header */}

      <div className="module-header">

        <div className="module-icon">
          <Server size={28} />
        </div>

        <div>

          <div className="page-label">
            DECEPTION INFRASTRUCTURE
          </div>

          <h1>Honeypot Services</h1>

          <p>
            Monitor simulated services deployed
            for threat detection.
          </p>

        </div>

      </div>


      {/* Status bar */}

      <div className="live-monitor-bar">

        <div className="live-status">

          <span className="pulse-dot"></span>

          ALL SERVICES OPERATIONAL

        </div>

        <div className="refresh-info">

          <Activity size={14} />

          Monitoring active

        </div>

      </div>


      {/* Service cards */}

      <div className="honeypot-grid">


        <ServiceCard
          name="HTTP Honeypot"
          protocol="HTTP"
          port="8080"
          icon={Globe}
          description="Simulated web service capturing reconnaissance and web attack patterns."
        />


        <ServiceCard
          name="SSH Honeypot"
          protocol="SSH"
          port="2222"
          icon={LockKeyhole}
          description="Simulated SSH endpoint detecting connection and credential probing."
        />


        <ServiceCard
          name="FTP Honeypot"
          protocol="FTP"
          port="2121"
          icon={Radio}
          description="Simulated FTP service capturing login and suspicious connection attempts."
        />

      </div>


      {/* Architecture */}

      <div className="panel honeypot-architecture">

        <div className="panel-header">

          <div>

            <h3>
              Honeypot Architecture
            </h3>

            <span>
              Simulated services → threat analysis
              → SQLite
            </span>

          </div>

        </div>


        <div className="architecture-flow">

          <div className="flow-box">
            <Globe size={20} />
            HTTP
            <small>:8080</small>
          </div>

          <div className="flow-arrow">
            →
          </div>

          <div className="flow-box">
            <LockKeyhole size={20} />
            SSH
            <small>:2222</small>
          </div>

          <div className="flow-arrow">
            →
          </div>

          <div className="flow-box">
            <Radio size={20} />
            FTP
            <small>:2121</small>
          </div>

          <div className="flow-arrow">
            →
          </div>

          <div className="flow-box central">
            <Server size={20} />
            THREAT ENGINE
            <small>Flask + SQLite</small>
          </div>

        </div>

      </div>

    </div>

  );
}

export default Honeypots;