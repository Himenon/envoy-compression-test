# Envoy Compression Test

## Setup

```bash
docker compose up -d
```

### Web Server Setup

```bash
docker compose run web sh

# In container
yarn start
```



### Attacker Setup

```bash
docker compose run attacker bash
```

