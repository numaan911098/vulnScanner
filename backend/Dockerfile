FROM ubuntu:22.04

WORKDIR /app

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install required tools
RUN apt-get update && apt-get install -y \
    nmap \
    python3 \
    python3-pip \
    curl \
    wget \
    git \
    unzip \
    ruby \
    ruby-dev \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install WPScan via gem
RUN gem install wpscan

# Install whatweb
RUN git clone https://github.com/urbanadventurer/WhatWeb.git /opt/whatweb \
    && ln -s /opt/whatweb/whatweb /usr/local/bin/whatweb \
    && chmod +x /usr/local/bin/whatweb

# Install assetfinder
RUN wget -q https://github.com/tomnomnom/assetfinder/releases/download/v0.1.1/assetfinder-linux-amd64-0.1.1.tgz -O /tmp/assetfinder.tgz \
    && tar -xzf /tmp/assetfinder.tgz -C /tmp \
    && mv /tmp/assetfinder /usr/local/bin/ \
    && chmod +x /usr/local/bin/assetfinder \
    && rm /tmp/assetfinder.tgz

# Install httpx - using the correct version and URL
RUN wget -q https://github.com/projectdiscovery/httpx/releases/download/v1.6.8/httpx_1.6.8_linux_amd64.zip -O /tmp/httpx.zip \
    && unzip /tmp/httpx.zip -d /tmp \
    && mv /tmp/httpx /usr/local/bin/ \
    && chmod +x /usr/local/bin/httpx \
    && rm /tmp/httpx.zip

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 5000
CMD ["python3", "app.py"]