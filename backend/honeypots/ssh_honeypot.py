import socket
from services.event_service import process_event

HOST = "0.0.0.0"
PORT = 2222


def start_server():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    server.bind((HOST, PORT))
    server.listen(20)

    print("========================================")
    print("        HONEYNET SSH HONEYPOT")
    print("========================================")
    print(f"SSH Honeypot running on port {PORT}")
    print("Security event monitoring: ENABLED")
    print("----------------------------------------")

    try:
        while True:
            client, address = server.accept()

            client_ip = address[0]
            client_port = address[1]

            try:
                client.settimeout(2)

                try:
                    data = client.recv(1024)
                except socket.timeout:
                    data = b""

                if data:
                    request_data = data.decode(
                        "utf-8",
                        errors="ignore"
                    )
                else:
                    request_data = "SSH Connection Attempt"

                event = process_event(
                    service="SSH",
                    source_ip=client_ip,
                    source_port=client_port,
                    destination_port=PORT,
                    data=request_data
                )

                print(
                    f"[SSH] {client_ip}:{client_port} -> {PORT} "
                    f"[{event['severity']}] "
                    f"[{event['category']}] "
                    f"Risk={event['risk_score']}"
                )

            except ConnectionResetError:
                print(
                    f"[SSH] {client_ip}:{client_port} "
                    f"connection closed by remote host"
                )

            except Exception as error:
                print(f"[SSH ERROR] {error}")

            finally:
                try:
                    client.close()
                except Exception:
                    pass

    except KeyboardInterrupt:
        print("\nSSH Honeypot stopped.")

    finally:
        server.close()


if __name__ == "__main__":
    start_server()

