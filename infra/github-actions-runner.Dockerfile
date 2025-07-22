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
 && apt-get clean

# Create runner user
RUN useradd -m runner
WORKDIR /home/runner

# Set runner version and arch
ENV RUNNER_VERSION=2.326.0
ENV RUNNER_ARCH=x64
ENV RUNNER_FILENAME=actions-runner-linux-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz
ENV RUNNER_URL=https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_FILENAME}

# Download and extract runner
RUN curl -o ${RUNNER_FILENAME} -L ${RUNNER_URL} \
 && tar xzf ${RUNNER_FILENAME} \
 && rm ${RUNNER_FILENAME}

COPY infra/github-actions-runner.sh .
RUN chmod +x ./github-actions-runner.sh

RUN chown -R runner:runner /home/runner
USER runner

ENTRYPOINT ["./github-actions-runner.sh"]
