{
  "{{ .Values.secrets.smtp.server }}": {
    "name": "{{ .Values.secrets.smtp.server }}",
    "host": "{{ .Values.secrets.smtp.host }}",
    "port": "{{ .Values.secrets.smtp.port }}",
    "username": "{{ .Values.secrets.smtp.username }}",
    "password": "{{ .Values.secrets.smtp.password }}"
  }
}
