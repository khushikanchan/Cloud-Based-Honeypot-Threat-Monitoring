import sqlite3
from datetime import datetime


DATABASE = "honeypot.db"


# --------------------------------------------------
# DATABASE CONNECTION
# --------------------------------------------------

def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# --------------------------------------------------
# INITIALIZE DATABASE
# --------------------------------------------------

def init_db():

    conn = get_connection()
    cursor = conn.cursor()

    # EVENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            service TEXT NOT NULL,
            source_ip TEXT NOT NULL,
            source_port INTEGER,
            destination_port INTEGER,
            event_type TEXT,
            category TEXT,
            severity TEXT,
            risk_score INTEGER,
            details TEXT
        )
    """)

    # ALERTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source_ip TEXT,
            service TEXT,
            category TEXT,
            severity TEXT,
            risk_score INTEGER,
            message TEXT,
            acknowledged INTEGER DEFAULT 0
        )
    """)

    # IP INTELLIGENCE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ip_intelligence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_ip TEXT UNIQUE,
            country TEXT,
            first_seen TEXT,
            last_seen TEXT,
            attack_count INTEGER DEFAULT 0,
            risk_score INTEGER DEFAULT 0
        )
    """)

    # PORT SCANS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS port_scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_ip TEXT,
            detected_at TEXT,
            ports TEXT,
            port_count INTEGER,
            risk_score INTEGER,
            severity TEXT
        )
    """)

    conn.commit()
    conn.close()


# --------------------------------------------------
# ADD EVENT
# --------------------------------------------------

def add_event(
    timestamp=None,
    service=None,
    source_ip=None,
    source_port=None,
    destination_port=None,
    event_type=None,
    category=None,
    severity=None,
    risk_score=0,
    details=""
):

    if timestamp is None:
        timestamp = datetime.now().isoformat(timespec="seconds")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO events (
            timestamp,
            service,
            source_ip,
            source_port,
            destination_port,
            event_type,
            category,
            severity,
            risk_score,
            details
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        timestamp,
        service,
        source_ip,
        source_port,
        destination_port,
        event_type,
        category,
        severity,
        risk_score,
        details
    ))

    event_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return event_id


# --------------------------------------------------
# ADD ALERT
# --------------------------------------------------

def add_alert(
    source_ip,
    service,
    category,
    severity,
    risk_score,
    message,
    timestamp=None
):

    if timestamp is None:
        timestamp = datetime.now().isoformat(timespec="seconds")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO alerts (
            timestamp,
            source_ip,
            service,
            category,
            severity,
            risk_score,
            message,
            acknowledged
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    """, (
        timestamp,
        source_ip,
        service,
        category,
        severity,
        risk_score,
        message
    ))

    alert_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return alert_id


# --------------------------------------------------
# UPDATE IP INTELLIGENCE
# --------------------------------------------------

def update_ip_intelligence(
    source_ip,
    risk_score,
    timestamp=None
):

    if timestamp is None:
        timestamp = datetime.now().isoformat(timespec="seconds")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM ip_intelligence
        WHERE source_ip = ?
    """, (source_ip,))

    existing = cursor.fetchone()

    if existing:

        new_attack_count = existing["attack_count"] + 1

        new_risk_score = max(
            existing["risk_score"],
            risk_score
        )

        cursor.execute("""
            UPDATE ip_intelligence
            SET
                last_seen = ?,
                attack_count = ?,
                risk_score = ?
            WHERE source_ip = ?
        """, (
            timestamp,
            new_attack_count,
            new_risk_score,
            source_ip
        ))

    else:

        cursor.execute("""
            INSERT INTO ip_intelligence (
                source_ip,
                country,
                first_seen,
                last_seen,
                attack_count,
                risk_score
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            source_ip,
            "Local Network",
            timestamp,
            timestamp,
            1,
            risk_score
        ))

    conn.commit()
    conn.close()


# --------------------------------------------------
# ADD PORT SCAN
# --------------------------------------------------

def add_port_scan(
    source_ip,
    ports,
    port_count,
    risk_score,
    severity,
    detected_at=None
):

    conn = get_connection()

    cursor = conn.cursor()

    if detected_at is None:
        detected_at = datetime.now().isoformat(
            timespec="seconds"
        )

    # --------------------------------------------------
    # Make sure ports are stored correctly
    # --------------------------------------------------

    if isinstance(ports, list):
        ports = ", ".join(
            str(port)
            for port in ports
        )

    ports = str(ports)

    # --------------------------------------------------
    # Insert
    # --------------------------------------------------

    cursor.execute(
        """
        INSERT INTO port_scans
        (
            source_ip,
            detected_at,
            ports,
            port_count,
            risk_score,
            severity
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            source_ip,
            detected_at,
            ports,
            port_count,
            risk_score,
            severity
        )
    )

    scan_id = cursor.lastrowid

    conn.commit()

    conn.close()

    return scan_id

# --------------------------------------------------
# GET EVENTS
# --------------------------------------------------

def get_events(limit=100):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM events
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()

    conn.close()

    return rows


# --------------------------------------------------
# GET ALERTS
# --------------------------------------------------

def get_alerts(limit=100):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM alerts
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()

    conn.close()

    return rows


# --------------------------------------------------
# GET IP INTELLIGENCE
# --------------------------------------------------

def get_ip_intelligence():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM ip_intelligence
        ORDER BY risk_score DESC, attack_count DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return rows


# --------------------------------------------------
# GET PORT SCANS
# --------------------------------------------------

def get_port_scans():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM port_scans
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    conn.close()

    return [
        dict(row)
        for row in rows
    ]


# --------------------------------------------------
# STATISTICS
# --------------------------------------------------

def get_statistics():

    conn = get_connection()
    cursor = conn.cursor()

    # Total events
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM events
    """)

    total_events = cursor.fetchone()["count"]

    # Service counts
    cursor.execute("""
        SELECT service, COUNT(*) AS count
        FROM events
        GROUP BY service
    """)

    service_rows = cursor.fetchall()

    service_counts = {
        "http": 0,
        "ssh": 0,
        "ftp": 0
    }

    for row in service_rows:

        service = row["service"].lower()

        if service in service_counts:
            service_counts[service] = row["count"]

    # Severity counts
    cursor.execute("""
        SELECT severity, COUNT(*) AS count
        FROM events
        GROUP BY severity
    """)

    severity_rows = cursor.fetchall()

    severity_counts = {
        "low": 0,
        "medium": 0,
        "high": 0
    }

    for row in severity_rows:

        severity = row["severity"].lower()

        if severity in severity_counts:
            severity_counts[severity] = row["count"]

    # Category counts
    cursor.execute("""
        SELECT category, COUNT(*) AS count
        FROM events
        GROUP BY category
    """)

    category_rows = cursor.fetchall()

    category_counts = {
        "reconnaissance": 0,
        "credential_attack": 0,
        "web_attack": 0,
        "port_scan": 0,
        "suspicious_connection": 0,
        "unknown": 0
    }

    for row in category_rows:

        category = row["category"]

        if category == "Credential Attack":
            category_counts["credential_attack"] = row["count"]

        elif category == "Web Attack":
            category_counts["web_attack"] = row["count"]

        elif category == "Port Scan":
            category_counts["port_scan"] = row["count"]

        elif category == "Reconnaissance":
            category_counts["reconnaissance"] = row["count"]

        elif category == "Suspicious Connection":
            category_counts["suspicious_connection"] = row["count"]

        elif category == "Unknown":
            category_counts["unknown"] = row["count"]

    # Attacks per hour
    cursor.execute("""
        SELECT
            substr(timestamp, 1, 13) AS hour,
            COUNT(*) AS count
        FROM events
        GROUP BY substr(timestamp, 1, 13)
        ORDER BY hour ASC
    """)

    hourly_rows = cursor.fetchall()

    attacks_per_hour = [
        {
            "hour": row["hour"],
            "count": row["count"]
        }
        for row in hourly_rows
    ]

    # Unique source IPs
    cursor.execute("""
        SELECT COUNT(DISTINCT source_ip) AS count
        FROM events
    """)

    unique_sources = cursor.fetchone()["count"]

    # Port scans
    cursor.execute("""
        SELECT COUNT(*) AS count
        FROM port_scans
    """)

    port_scans = cursor.fetchone()["count"]

    conn.close()

    return {
        "total_events": total_events,

        "unique_sources": unique_sources,

        "port_scans": port_scans,

        "http": service_counts["http"],
        "ssh": service_counts["ssh"],
        "ftp": service_counts["ftp"],

        "low": severity_counts["low"],
        "medium": severity_counts["medium"],
        "high": severity_counts["high"],

        "reconnaissance":
            category_counts["reconnaissance"],

        "credential_attack":
            category_counts["credential_attack"],

        "web_attack":
            category_counts["web_attack"],

        "port_scan":
            category_counts["port_scan"],

        "suspicious_connection":
            category_counts["suspicious_connection"],

        "unknown":
            category_counts["unknown"],

        "attacks_per_hour":
            attacks_per_hour
    }