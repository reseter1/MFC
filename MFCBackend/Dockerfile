FROM mcr.microsoft.com/dotnet/sdk:8.0

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    build-essential \
    cmake \
    git \
    libjson-c-dev \
    libwebsockets-dev \
    && rm -rf /var/lib/apt/lists/*

RUN wget -O ttyd.tar.gz https://github.com/tsl0922/ttyd/archive/refs/tags/1.7.4.tar.gz \
    && tar -xzf ttyd.tar.gz \
    && cd ttyd-1.7.4 \
    && mkdir build \
    && cd build \
    && cmake .. \
    && make \
    && make install \
    && cd ../.. \
    && rm -rf ttyd-1.7.4 ttyd.tar.gz

COPY . .

RUN dotnet restore

ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5277
EXPOSE 8080

ENV ASPNETCORE_URLS=http://0.0.0.0:5277
ENV ASPNETCORE_HOSTNAME=0.0.0.0
ENV DOTNET_RUNNING_IN_CONTAINER=true


RUN echo '#!/bin/bash\n\
ttyd -p 8080 -t fontSize=14 -t theme={"background":"#000000"} --writable --credential admin:admin bash &\n\
dotnet run --urls "http://0.0.0.0:5277"\n' > /app/start.sh \
    && chmod +x /app/start.sh

CMD ["/app/start.sh"] 