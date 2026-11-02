from database import (
    add_event,
    add_alert,
    update_ip_intelligence,
    add_port_scan,
)

from detector import analyze_event
from risk_engine import (
    calculate_risk,
    severity_from_score
)

from port_scanner_detector import (
    port_scan_detector
)

from services.realtime import (
    emit_event,
    emit_alert,
)


def process_event(
    service,
    source_ip,
    source_port,
    destination_port,
    data
):

    # ======================================================
    # 1. Analyze activity
    # ======================================================

    analysis = analyze_event(
        service,
        data
    )

    event_type = analysis["event_type"]
    category = analysis["category"]

    # ======================================================
    # 2. Calculate risk
    # ======================================================

    risk_score = calculate_risk(
        category,
        data
    )

    severity = severity_from_score(
        risk_score
    )

    details = data

    # ======================================================
    # 3. Port scan detection
    # ======================================================

    scan_result = port_scan_detector.record_connection(
        source_ip=source_ip,
        destination_port=destination_port
    )

    scan_detected = scan_result["detected"]

    if scan_detected:

        # ----------------------------------------------
        # Port scan has been detected
        # ----------------------------------------------

        category = "Port Scan"

        event_type = "Port Scan Detected"

        severity = "HIGH"

        risk_score = 90

        detected_ports = scan_result["ports"]

        # IMPORTANT:
        # Store ports as a normal string.
        # Do NOT store the text "Multiple ports contacted..."
        # in the ports database column.

        ports_string = ", ".join(
            str(port)
            for port in detected_ports
        )

        details = (
            "Multiple ports contacted: "
            + ports_string
        )

        # ----------------------------------------------
        # Save port scan
        # ----------------------------------------------

        add_port_scan(
            source_ip=source_ip,
            ports=ports_string,
            port_count=scan_result["port_count"],
            risk_score=90,
            severity="HIGH"
        )

        print()
        print("=" * 60)
        print("🚨 PORT SCAN DETECTED")
        print("=" * 60)
        print(f"Source IP    : {source_ip}")
        print(f"Ports        : {ports_string}")
        print(f"Port Count   : {scan_result['port_count']}")
        print("Risk Score   : 90")
        print("Severity     : HIGH")
        print("=" * 60)
        print()

    # ======================================================
    # 4. Save security event
    # ======================================================

    event_id = add_event(
        timestamp=None,
        service=service,
        source_ip=source_ip,
        source_port=source_port,
        destination_port=destination_port,
        event_type=event_type,
        category=category,
        severity=severity,
        risk_score=risk_score,
        details=details
    )

    # ======================================================
    # 5. Update IP intelligence
    # ======================================================

    update_ip_intelligence(
        source_ip=source_ip,
        risk_score=risk_score
    )

    # ======================================================
    # 6. Create event object
    # ======================================================

    event = {
        "id": event_id,
        "service": service,
        "source_ip": source_ip,
        "source_port": source_port,
        "destination_port": destination_port,
        "event_type": event_type,
        "category": category,
        "severity": severity,
        "risk_score": risk_score,
        "details": details
    }

    # ======================================================
    # 7. Send event to frontend
    # ======================================================

    try:
        emit_event(event)
    except Exception as error:
        print(
            f"[REALTIME EVENT ERROR] {error}"
        )

    # ======================================================
    # 8. Create alert
    # ======================================================

    if severity in ["MEDIUM", "HIGH"]:

        if scan_detected:

            message = (
                f"PORT SCAN detected from "
                f"{source_ip}: "
                f"{scan_result['port_count']} ports contacted"
            )

        else:

            message = (
                f"{severity} threat detected from "
                f"{source_ip} on {service}"
            )

        # ----------------------------------------------
        # Save alert
        # ----------------------------------------------

        alert_id = add_alert(
            timestamp=None,
            source_ip=source_ip,
            service=service,
            category=category,
            severity=severity,
            risk_score=risk_score,
            message=message
        )

        # ----------------------------------------------
        # Alert object
        # ----------------------------------------------

        alert = {
            "id": alert_id,
            "source_ip": source_ip,
            "service": service,
            "category": category,
            "severity": severity,
            "risk_score": risk_score,
            "message": message
        }

        # ----------------------------------------------
        # Send alert to React
        # ----------------------------------------------

        try:
            emit_alert(alert)
        except Exception as error:
            print(
                f"[REALTIME ALERT ERROR] {error}"
            )

    # ======================================================
    # 9. Terminal output
    # ======================================================

    print(
        f"[{service}] "
        f"{source_ip}:{source_port} -> "
        f"{destination_port} "
        f"[{severity}] "
        f"[{category}] "
        f"Risk={risk_score}"
    )

    return event