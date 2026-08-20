FROM node:22-bookworm

# Install Python
RUN apt-get update \
    && apt-get install -y python3 python3-venv python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# -----------------------------
# Node dependencies
# -----------------------------
COPY package*.json ./
RUN npm ci

# -----------------------------
# Python dependencies
# -----------------------------
COPY backend/requirements.txt ./backend/requirements.txt

RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --upgrade pip \
    && /opt/venv/bin/pip install -r backend/requirements.txt

ENV PATH="/opt/venv/bin:$PATH"

# -----------------------------
# Copy complete project
# -----------------------------
COPY . .

# -----------------------------
# Build React + Express
# -----------------------------
RUN npm run build

# Render gives the public port through $PORT.
# FastAPI stays internal on 8000.
ENV PYTHON_API_URL=http://127.0.0.1:8000

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]