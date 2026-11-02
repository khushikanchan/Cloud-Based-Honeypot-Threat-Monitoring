def analyze_event(service, data):
    """
    Analyze captured honeypot activity.

    This performs pattern-based detection only.
    It does not execute attacker-controlled input.
    """

    text = str(data).lower()

    # =========================================
    # HTTP DETECTION
    # =========================================

    if service.upper() == "HTTP":

        web_patterns = {
            "union select": "SQL Injection Pattern",
            "select password": "SQL Injection Pattern",
            "<script": "XSS Pattern",
            "javascript:": "XSS Pattern",
            "../": "Path Traversal Pattern",
            "etc/passwd": "Sensitive File Probe",
            "cmd=": "Command Injection Pattern",
            "powershell": "PowerShell Probe"
        }

        for pattern, event_name in web_patterns.items():

            if pattern in text:

                return {
                    "event_type": event_name,
                    "category": "Web Attack",
                    "details": str(data)
                }

        # Common reconnaissance paths
        reconnaissance_paths = [
            "/admin",
            "/login",
            "/wp-admin",
            "/robots.txt",
            "/.env",
            "/phpmyadmin",
            "/server-status"
        ]

        for path in reconnaissance_paths:

            if path in text:

                return {
                    "event_type": "Web Reconnaissance",
                    "category": "Reconnaissance",
                    "details": str(data)
                }

        return {
            "event_type": "HTTP Connection",
            "category": "Suspicious Connection",
            "details": str(data)
        }

    # =========================================
    # SSH DETECTION
    # =========================================

    if service.upper() == "SSH":

        credential_patterns = [
            "root",
            "admin",
            "administrator",
            "password",
            "passwd",
            "login",
            "username",
            "user"
        ]

        for pattern in credential_patterns:

            if pattern in text:

                return {
                    "event_type": "SSH Credential Probe",
                    "category": "Credential Attack",
                    "details": str(data)
                }

        if "ssh-" in text:

            return {
                "event_type": "SSH Connection Attempt",
                "category": "Reconnaissance",
                "details": str(data)
            }

        if (
            "get /" in text
            or "post /" in text
            or "http/1.1" in text
            or "http/2" in text
        ):

            return {
                "event_type": "Protocol Mismatch",
                "category": "Suspicious Connection",
                "details": "HTTP request detected on SSH honeypot"
            }

        return {
            "event_type": "Unknown SSH Activity",
            "category": "Unknown",
            "details": str(data)
        }

    # =========================================
    # FTP DETECTION
    # =========================================

    if service.upper() == "FTP":

        ftp_patterns = [
            "anonymous",
            "user ",
            "pass ",
            "login"
        ]

        for pattern in ftp_patterns:

            if pattern in text:

                return {
                    "event_type": "FTP Login Attempt",
                    "category": "Credential Attack",
                    "details": str(data)
                }

        return {
            "event_type": "FTP Connection",
            "category": "Reconnaissance",
            "details": str(data)
        }

    # =========================================
    # DEFAULT
    # =========================================

    return {
        "event_type": "Unknown Activity",
        "category": "Unknown",
        "details": str(data)
    }