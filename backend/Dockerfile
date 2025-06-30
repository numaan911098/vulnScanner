FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for security tools
RUN apt-get update && apt-get install -y \
    nmap \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install WhatWeb
RUN git clone https://github.com/urbanadventurer/WhatWeb.git /opt/whatweb
RUN ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb

# Install WPScan
RUN apt-get update && apt-get install -y ruby ruby-dev build-essential
RUN gem install wpscan

# Install assetfinder and httpx
RUN wget -O /tmp/assetfinder.tar.gz https://github.com/tomnomnom/assetfinder/releases/download/v0.1.1/assetfinder-linux-amd64-0.1.1.tgz \
    && tar -xzf /tmp/assetfinder.tar.gz -C /tmp \
    && mv /tmp/assetfinder /usr/local/bin/ \
    && chmod +x /usr/local/bin/assetfinder

RUN wget -O /tmp/httpx.tar.gz https://github.com/projectdiscovery/httpx/releases/download/v1.3.7/httpx_1.3.7_linux_amd64.tar.gz \
    && tar -xzf /tmp/httpx.tar.gz -C /tmp \
    && mv /tmp/httpx /usr/local/bin/ \
    && chmod +x /usr/local/bin/httpx

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]