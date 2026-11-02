from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO

from database import (
    init_db,
    get_events,
    get_alerts,
    get_ip_intelligence,
    get_port_scans,
    get_statistics,
)

from services.realtime import set_socketio


# ==========================================================
# FLASK APPLICATION
# ==========================================================

app = Flask(__name__)

app.config["SECRET_KEY"] = "honeypot-secret-key"

CORS(app)


# ==========================================================
# SOCKET.IO
# ==========================================================

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading"
)

# Give the realtime service access to Socket.IO
set_socketio(socketio)


# ==========================================================
# HOME
# ==========================================================

@app.route("/")
def home():

    return jsonify({
        "status": "online",
        "service": "Cloud-Based Honeypot Threat Monitoring API",
        "version": "1.0"
    })


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route("/api/health")
def health():

    return jsonify({
        "status": "healthy",
        "database": "connected",
        "socketio": "enabled"
    })


# ==========================================================
# EVENTS
# ==========================================================

@app.route("/api/events", methods=["GET"])
def events():

    limit = request.args.get(
        "limit",
        default=100,
        type=int
    )

    events_data = get_events(limit)

    return jsonify([
        dict(event)
        for event in events_data
    ])


# ==========================================================
# ALERTS
# ==========================================================

@app.route("/api/alerts", methods=["GET"])
def alerts():

    limit = request.args.get(
        "limit",
        default=100,
        type=int
    )

    alerts_data = get_alerts(limit)

    return jsonify([
        dict(alert)
        for alert in alerts_data
    ])


# ==========================================================
# THREAT INTELLIGENCE
# ==========================================================

@app.route(
    "/api/threat-intelligence",
    methods=["GET"]
)
def threat_intelligence():

    intelligence = get_ip_intelligence()

    return jsonify([
        dict(ip)
        for ip in intelligence
    ])


# ==========================================================
# PORT SCANS
# ==========================================================

@app.route(
    "/api/port-scans",
    methods=["GET"]
)
def port_scans():

    scans = get_port_scans()

    return jsonify([
        dict(scan)
        for scan in scans
    ])


# ==========================================================
# STATISTICS
# ==========================================================

@app.route(
    "/api/statistics",
    methods=["GET"]
)
def statistics():

    stats = get_statistics()

    return jsonify(stats)


# ==========================================================
# HONEYPOT STATUS
# ==========================================================

@app.route(
    "/api/honeypots",
    methods=["GET"]
)
def honeypots():

    return jsonify([
        {
            "service": "HTTP",
            "port": 8080,
            "protocol": "HTTP",
            "status": "ACTIVE"
        },
        {
            "service": "SSH",
            "port": 2222,
            "protocol": "SSH",
            "status": "ACTIVE"
        },
        {
            "service": "FTP",
            "port": 2121,
            "protocol": "FTP",
            "status": "ACTIVE"
        }
    ])


# ==========================================================
# DASHBOARD SUMMARY
# ==========================================================

@app.route(
    "/api/dashboard",
    methods=["GET"]
)
def dashboard():

    stats = get_statistics()

    events_data = get_events(10)

    alerts_data = get_alerts(10)

    return jsonify({

        "statistics": stats,

        "recent_events": [
            dict(event)
            for event in events_data
        ],

        "recent_alerts": [
            dict(alert)
            for alert in alerts_data
        ]

    })


# ==========================================================
# SOCKET.IO CONNECTION
# ==========================================================

@socketio.on("connect")
def handle_connect():

    print(
        "[SOCKET] React dashboard connected"
    )


@socketio.on("disconnect")
def handle_disconnect():

    print(
        "[SOCKET] React dashboard disconnected"
    )


# ==========================================================
# START SERVER
# ==========================================================

if __name__ == "__main__":

    # Initialize database
    init_db()

    print()
    print("=" * 60)
    print(
        " CLOUD-BASED HONEYPOT THREAT MONITORING SYSTEM"
    )
    print("=" * 60)
    print(
        "Flask API    : http://localhost:5000"
    )
    print(
        "Socket.IO    : ENABLED"
    )
    print(
        "CORS         : ENABLED"
    )
    print("=" * 60)
    print()

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        allow_unsafe_werkzeug=True
    )