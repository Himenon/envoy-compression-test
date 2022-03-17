FROM ubuntu:18.04
WORKDIR /app
COPY ./setup.sh .
RUN apt update && apt install wget curl --yes
RUN ./setup.sh
