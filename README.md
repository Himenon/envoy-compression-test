# Envoy Compression Test

## Network Map

```
attacker --> envoy-gateway:8000 --> envoy-proxy:8000 --> web:80
```

## Setup

```bash
docker compose up -d
```

### Web Server Setup

```bash
docker compose exec web sh

# In container
yarn start
```

### Attacker Setup

```bash
docker compose exec attacker bash

# Communication Check
curl http://envoy-gateway:8000/ping -H "target: pure"
curl http://envoy-gateway:8000/ping -H "target: compression"

# Request  : envoy-gateway:8000 --------> envoy-proxy-pure:8000 --------> web:80
# Response : envoy-gateway:8000 <-------- envoy-proxy-pure:8000 <-------- web:80
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -H "target: pure" > /dev/null

# Request  : envoy-gateway:8000 --------> envoy-proxy-pure:8000 --------> web:80
# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-pure:8000 <-------- web:80
echo "GET http://envoy-gateway:8000?compression=gzip" | ./vegeta attack -rate 1/1s -H "target: pure" > /dev/null

# Request  : envoy-gateway:8000 --------> envoy-proxy-compression:8000 --------> web:80
# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-compression:8000 <-(gzip)- web:80
echo "GET http://envoy-gateway:8000?compression=gzip" | ./vegeta attack -rate 1/1s -H "target: compression" > /dev/null

# Request  : envoy-gateway:8000 --------> envoy-proxy-compression:8000 --------> web:80
# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-compression:8000 <-(gzip)- web:80
echo "GET http://envoy-gateway:8000/non-compression-proxy?compress=gzip" | ./vegeta attack -rate 1/1s -H "target: compression" > /dev/null
```

## Dashboard

- Grafana: <http://localhost:5000>
  - User: `admin`
  - Password: `admin`
- Open Dashboard
  - <http://localhost:5000/d/sWlZ99Ynz/envoy-monitor?orgId=1>
