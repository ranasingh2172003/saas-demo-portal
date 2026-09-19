#!/bin/bash
# Kill anything on port 8082
fuser -k 8082/tcp 2>/dev/null
cd /workspaces/saas-demo-portal
exec .venv/bin/python3 agent.py start --port 8082
