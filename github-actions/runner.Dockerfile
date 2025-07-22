FROM --platform=linux/amd64 ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    tar \
    libicu70 \
    libssl3 \
    jq \
    git \
    ca-certificates \
    lsb-release \
    gnupg \
    apt-transport-https \
    software-properties-common \
 && apt-get clean

# Install Docker Engine
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker.gpg \
 && echo \
   "deb [arch=amd64 signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
 && apt-get update \
 && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin \
 && apt-get clean

# Create runner user
RUN useradd -m runner
WORKDIR /home/runner
ENV HOME /home/runner

# Set runner version and arch
ENV RUNNER_VERSION=2.326.0
ENV RUNNER_ARCH=x64
ENV RUNNER_FILENAME=actions-runner-linux-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz
ENV RUNNER_URL=https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_FILENAME}

# Download and extract runner
RUN curl -o ${RUNNER_FILENAME} -L ${RUNNER_URL} \
 && tar xzf ${RUNNER_FILENAME} \
 && rm ${RUNNER_FILENAME}

COPY github-actions/runner.sh .
RUN chmod +x ./runner.sh

# Give runner user permissions for Docker
RUN usermod -aG docker runner \
 && chown -R runner:runner /home/runner

ENTRYPOINT ["./runner.sh"]
