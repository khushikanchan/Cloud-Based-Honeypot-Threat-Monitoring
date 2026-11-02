def calculate_risk(category, details=""):
    """
    Calculate a security risk score from 0 to 100.
    """

    category = category.lower()

    risk_values = {
        "reconnaissance": 20,
        "credential attack": 55,
        "web attack": 80,
        "port scan": 90,
        "suspicious connection": 45,
        "unknown": 10
    }

    score = risk_values.get(category, 10)

    details_lower = details.lower()

    # Increase score for particularly suspicious patterns
    high_risk_patterns = [
        "union select",
        "select password",
        "<script",
        "../",
        "etc/passwd",
        "powershell",
        "cmd=",
        "root",
        "administrator",
        "admin",
        "password"
    ]

    for pattern in high_risk_patterns:
        if pattern in details_lower:
            score += 5

    return min(score, 100)


def severity_from_score(score):
    if score <= 30:
        return "LOW"

    if score <= 70:
        return "MEDIUM"

    return "HIGH"