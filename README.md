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

# Check
curl http://envoy-gateway:8000/ping

# Polling Start
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s > /dev/null
```

## Dashboard

* Grafana: <http://localhost:5000>
    * User: `admin`
    * Password: `admin`
* Open Dashboard
    * <http://localhost:5000/d/sWlZ99Ynz/envoy-monitor?orgId=1>
