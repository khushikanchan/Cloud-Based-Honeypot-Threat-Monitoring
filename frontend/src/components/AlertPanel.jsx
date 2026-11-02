import { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  ShieldAlert,
} from "lucide-react";

import socket from "../socket";

function AlertPanel() {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {

    const handleAlert = (alert) => {

      console.log(
        "[REALTIME ALERT]",
        alert
      );

      setAlerts((previous) => [
        alert,
        ...previous,
      ]);

    };

    socket.on(
      "new_alert",
      handleAlert
    );

    return () => {

      socket.off(
        "new_alert",
        handleAlert
      );

    };

  }, []);


  const removeAlert = (id) => {

    setAlerts((previous) =>
      previous.filter(
        (alert) =>
          alert.id !== id
      )
    );

  };


  if (alerts.length === 0) {

    return null;

  }


  return (

    <div className="realtime-alert-container">

      {alerts.slice(0, 5).map(
        (alert, index) => (

          <div
            className={`realtime-alert ${alert.severity?.toLowerCase()}`}
            key={`${alert.id}-${index}`}
          >

            <div className="alert-icon">

              <ShieldAlert size={22} />

            </div>


            <div className="alert-content">

              <div className="alert-title">

                <span>
                  SECURITY ALERT
                </span>

                <strong>
                  {alert.severity}
                </strong>

              </div>


              <h4>
                {alert.category}
              </h4>


              <p>
                {alert.message}
              </p>


              <div className="alert-meta">

                <span>
                  Source: {alert.source_ip}
                </span>

                <span>
                  Service: {alert.service}
                </span>

                <span>
                  Risk: {alert.risk_score}
                </span>

              </div>

            </div>


            <button
              className="alert-close"
              onClick={() =>
                removeAlert(alert.id)
              }
            >

              <X size={17} />

            </button>

          </div>

        )
      )}

    </div>

  );

}

export default AlertPanel;