socketio = None


def set_socketio(socket_instance):
    global socketio
    socketio = socket_instance


def emit_event(event):
    if socketio is None:
        return

    try:
        socketio.emit("new_event", event)
    except Exception as error:
        print(f"[SOCKET ERROR] {error}")


def emit_alert(alert):
    if socketio is None:
        return

    try:
        socketio.emit("new_alert", alert)
    except Exception as error:
        print(f"[SOCKET ERROR] {error}")