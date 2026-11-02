from collections import defaultdict
from datetime import datetime, timedelta


class PortScanDetector:
    """
    Detects when the same source IP contacts multiple
    honeypot ports within a short period of time.
    """

    def __init__(self, threshold=3, time_window=60, cooldown=60):
        self.threshold = threshold
        self.time_window = time_window
        self.cooldown = cooldown

        # source_ip -> list of (destination_port, timestamp)
        self.connections = defaultdict(list)

        # source_ip -> last time a scan was reported
        self.last_detection = {}

    def record_connection(self, source_ip, destination_port):
        now = datetime.now()

        # --------------------------------------------------
        # Add current connection
        # --------------------------------------------------

        self.connections[source_ip].append(
            (destination_port, now)
        )

        # --------------------------------------------------
        # Remove old connections
        # --------------------------------------------------

        cutoff = now - timedelta(
            seconds=self.time_window
        )

        self.connections[source_ip] = [
            item
            for item in self.connections[source_ip]
            if item[1] >= cutoff
        ]

        # --------------------------------------------------
        # Get unique ports
        # --------------------------------------------------

        unique_ports = sorted(
            set(
                port
                for port, timestamp in self.connections[source_ip]
            )
        )

        port_count = len(unique_ports)

        # --------------------------------------------------
        # Check threshold
        # --------------------------------------------------

        detected = port_count >= self.threshold

        # --------------------------------------------------
        # Prevent duplicate detections
        # --------------------------------------------------

        if detected:

            last_detection = self.last_detection.get(
                source_ip
            )

            if last_detection:

                seconds_since_detection = (
                    now - last_detection
                ).total_seconds()

                if seconds_since_detection < self.cooldown:

                    detected = False

            if detected:

                self.last_detection[source_ip] = now

        return {
            "detected": detected,
            "ports": unique_ports,
            "port_count": port_count,
            "source_ip": source_ip,
            "timestamp": now.isoformat()
        }


# ----------------------------------------------------------
# Global detector
# ----------------------------------------------------------

port_scan_detector = PortScanDetector(
    threshold=3,
    time_window=60,
    cooldown=60
)