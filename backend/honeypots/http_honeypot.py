from http.server import BaseHTTPRequestHandler, HTTPServer
from services.event_service import process_event
import html
import uuid


HOST = "0.0.0.0"
PORT = 8080


class HoneypotHandler(BaseHTTPRequestHandler):

    # --------------------------------------------------
    # GET REQUEST
    # --------------------------------------------------

    def do_GET(self):

        client_ip = self.client_address[0]
        client_port = self.client_address[1]

        request_data = (
            f"{self.command} "
            f"{self.path} "
            f"{self.request_version}"
        )

        # --------------------------------------------------
        # PROCESS SECURITY EVENT
        # --------------------------------------------------

        try:

            event = process_event(
                service="HTTP",
                source_ip=client_ip,
                source_port=client_port,
                destination_port=PORT,
                data=request_data
            )

            print(
                f"[HTTP] "
                f"{client_ip}:{client_port} -> "
                f"{self.path} "
                f"[{event['severity']}] "
                f"[{event['category']}] "
                f"Risk={event['risk_score']}"
            )

        except Exception as error:

            print(
                f"[HTTP ERROR] {error}"
            )

        # --------------------------------------------------
        # GENERATE REQUEST ID
        # --------------------------------------------------

        request_id = (
            "HP-" +
            uuid.uuid4().hex[:8].upper()
        )

        # Escape path so malicious HTML cannot execute
        safe_path = html.escape(self.path)

        # --------------------------------------------------
        # PROFESSIONAL HONEYPOT PAGE
        # --------------------------------------------------

        page = f"""
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1.0">

<title>HoneyNet Security Gateway</title>

<style>

* {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}}

body {{

    min-height: 100vh;

    display: flex;

    justify-content: center;

    align-items: center;

    background:
        radial-gradient(
            circle at top,
            #162033 0%,
            #080d16 45%,
            #04070c 100%
        );

    font-family:
        "Segoe UI",
        Arial,
        sans-serif;

    color: #e2e8f0;

}}

.container {{

    width: 92%;

    max-width: 650px;

    background:
        rgba(15, 23, 42, 0.94);

    border:
        1px solid rgba(56, 189, 248, 0.25);

    border-radius: 18px;

    padding: 42px;

    box-shadow:
        0 25px 80px rgba(0,0,0,0.55),
        0 0 35px rgba(56,189,248,0.08);

    position: relative;

    overflow: hidden;

}}

.container::before {{

    content: "";

    position: absolute;

    top: 0;

    left: 0;

    right: 0;

    height: 3px;

    background:
        linear-gradient(
            90deg,
            #38bdf8,
            #6366f1,
            #38bdf8
        );

}}

.logo {{

    display: flex;

    align-items: center;

    gap: 14px;

    margin-bottom: 35px;

}}

.logo-icon {{

    width: 48px;

    height: 48px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 12px;

    background:
        rgba(56,189,248,0.10);

    border:
        1px solid rgba(56,189,248,0.25);

    font-size: 23px;

}}

.logo-title {{

    font-size: 18px;

    font-weight: 700;

    letter-spacing: 1.5px;

}}

.logo-subtitle {{

    font-size: 11px;

    color: #64748b;

    margin-top: 3px;

    letter-spacing: 1px;

}}

.status {{

    display: inline-flex;

    align-items: center;

    gap: 9px;

    padding: 7px 12px;

    border-radius: 20px;

    background:
        rgba(245,158,11,0.08);

    border:
        1px solid rgba(245,158,11,0.20);

    color: #fbbf24;

    font-size: 11px;

    font-weight: 600;

    letter-spacing: 0.8px;

    margin-bottom: 22px;

}}

.status-dot {{

    width: 7px;

    height: 7px;

    border-radius: 50%;

    background: #f59e0b;

    box-shadow:
        0 0 10px #f59e0b;

}}

h1 {{

    font-size: 30px;

    margin-bottom: 12px;

    letter-spacing: -0.5px;

}}

.description {{

    color: #94a3b8;

    font-size: 14px;

    line-height: 1.7;

    margin-bottom: 30px;

}}

.info-grid {{

    display: grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap: 12px;

    margin-bottom: 28px;

}}

.info-box {{

    padding: 16px;

    background:
        rgba(30,41,59,0.55);

    border:
        1px solid rgba(148,163,184,0.10);

    border-radius: 10px;

}}

.label {{

    display: block;

    color: #64748b;

    font-size: 10px;

    text-transform: uppercase;

    letter-spacing: 1px;

    margin-bottom: 7px;

}}

.value {{

    color: #cbd5e1;

    font-family: monospace;

    font-size: 13px;

    word-break: break-all;

}}

.footer {{

    border-top:
        1px solid rgba(148,163,184,0.10);

    padding-top: 20px;

    display: flex;

    justify-content: space-between;

    color: #475569;

    font-size: 11px;

}}

.warning {{

    color: #64748b;

}}

@media(max-width: 500px) {{

    .container {{

        padding: 28px;

    }}

    .info-grid {{

        grid-template-columns: 1fr;

    }}

    h1 {{

        font-size: 25px;

    }}

}}

</style>

</head>


<body>

<div class="container">

    <div class="logo">

        <div class="logo-icon">
            🛡
        </div>

        <div>

            <div class="logo-title">
                HONEYNET
            </div>

            <div class="logo-subtitle">
                SECURITY MONITORING GATEWAY
            </div>

        </div>

    </div>


    <div class="status">

        <span class="status-dot"></span>

        SERVICE UNAVAILABLE

    </div>


    <h1>
        System Access Restricted
    </h1>


    <p class="description">

        The requested service is temporarily unavailable.
        Your request has been received by the security
        monitoring gateway.

    </p>


    <div class="info-grid">

        <div class="info-box">

            <span class="label">
                HTTP Status
            </span>

            <span class="value">
                503 Service Unavailable
            </span>

        </div>


        <div class="info-box">

            <span class="label">
                Gateway
            </span>

            <span class="value">
                HONEYNET
            </span>

        </div>


        <div class="info-box">

            <span class="label">
                Request ID
            </span>

            <span class="value">
                {request_id}
            </span>

        </div>


        <div class="info-box">

            <span class="label">
                Requested Path
            </span>

            <span class="value">
                {safe_path}
            </span>

        </div>

    </div>


    <div class="footer">

        <span>
            Security Monitoring System
        </span>

        <span class="warning">
            Request Logged
        </span>

    </div>

</div>

</body>

</html>
"""

        # --------------------------------------------------
        # HTTP RESPONSE
        # --------------------------------------------------

        self.send_response(503)

        self.send_header(
            "Content-Type",
            "text/html; charset=utf-8"
        )

        self.send_header(
            "Content-Length",
            str(len(page.encode("utf-8")))
        )

        self.end_headers()

        self.wfile.write(
            page.encode("utf-8")
        )


    # --------------------------------------------------
    # SUPPRESS DEFAULT LOGGING
    # --------------------------------------------------

    def log_message(self, format, *args):

        return


# --------------------------------------------------
# START HONEYPOT
# --------------------------------------------------

def start_server():

    server = HTTPServer(
        (HOST, PORT),
        HoneypotHandler
    )

    print("")
    print("=" * 50)
    print("        HONEYNET HTTP HONEYPOT")
    print("=" * 50)
    print(f"HTTP Honeypot running on port {PORT}")
    print("Security event monitoring: ENABLED")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    print("")

    try:

        server.serve_forever()

    except KeyboardInterrupt:

        print("\nHTTP Honeypot stopped.")

    finally:

        server.server_close()


if __name__ == "__main__":

    start_server()