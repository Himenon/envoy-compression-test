FROM ubuntu:18.04 AS INSTALLER
WORKDIR /app
COPY ./setup.sh .
RUN apt update && apt install wget --yes
RUN ./setup.sh

FROM ubuntu:18.04

WORKDIR /app
COPY --from=INSTALLER /app/vegeta ./
