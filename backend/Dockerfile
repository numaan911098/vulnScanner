FROM kalilinux/kali-rolling

WORKDIR /app

# Update package list and install required tools
RUN apt-get update && apt-get install -y \
    nmap \
    whatweb \
    wpscan \
    python3 \
    python3-pip \
    curl \
    wget \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install assetfinder
RUN wget -q https://github.com/tomnomnom/assetfinder/releases/download/v0.1.1/assetfinder-linux-amd64-0.1.1.tgz -O /tmp/assetfinder.tgz \
    && tar -xzf /tmp/assetfinder.tgz -C /tmp \
    && mv /tmp/assetfinder /usr/local/bin/ \
    && chmod +x /usr/local/bin/assetfinder \
    && rm /tmp/assetfinder.tgz

# Install httpx (using correct URL)
RUN wget -q https://github.com/projectdiscovery/httpx/releases/download/v1.6.8/httpx_1.6.8_linux_amd64.zip -O /tmp/httpx.zip \
    && apt-get update && apt-get install -y unzip \
    && unzip /tmp/httpx.zip -d /tmp \
    && mv /tmp/httpx /usr/local/bin/ \
    && chmod +x /usr/local/bin/httpx \
    && rm /tmp/httpx.zip \
    && apt-get remove -y unzip \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 5000

CMD ["python3", "app.py"]