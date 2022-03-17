# Envoy Compression Test

## Architecture

![アーキテクチャ](docs/architecture.png)

## Setup

```bash
docker compose up -d
```

### Web Server Setup

```bash
docker compose exec web sh

yarn start
```

### Attacker Setup

[Attack Scenario](./attacker/run.sh)

```bash
docker compose exec attacker bash

# Communication Check
curl http://envoy-gateway:8000/ping -H "target-proxy: pure"
curl http://envoy-gateway:8000/ping -H "target-proxy: compression"

# Request  : envoy-gateway:8000 --------> envoy-proxy-pure:8000 --------> web:80
# Response : envoy-gateway:8000 <-------- envoy-proxy-pure:8000 <-------- web:80
curl http://envoy-gateway:8000 -H "target-proxy: pure" -v > /dev/null
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: pure" > /dev/null

# Request  : envoy-gateway:8000 --------> envoy-proxy-pure:8000 --------> web:80
# Response : envoy-gateway:8000 <-------- envoy-proxy-pure:8000 <-(gzip)- web:80
curl http://envoy-gateway:8000 -H "target-proxy: pure" -H "web-compression: true" -H "accept-encoding: gzip" -v > /dev/null
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: pure" -header "web-compression: true" -header "accept-encoding: gzip" > /dev/null

# Request  : envoy-gateway:8000 --------> envoy-proxy-compression:8000 --------> web:80
# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-compression:8000 <-------- web:80
curl http://envoy-gateway:8000 -H "target-proxy: compression" -H "accept-encoding: gzip" -v > /dev/null
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: compression" -header "accept-encoding: gzip" > /dev/null

# Request  : envoy-gateway:8000 --------> envoy-proxy-compression:8000 --------> web:80
# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-compression:8000 <-(gzip)- web:80
curl http://envoy-gateway:8000 -H "target-proxy: compression" -H "web-compression: true" -H "accept-encoding: gzip" -v > /dev/null
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: compression" -header "web-compression: true" -header "accept-encoding: gzip" > /dev/null
```

Check Response Header: `transfer-encoding: chunked` or `content-encoding: *`

## Dashboard

- Grafana: <http://localhost:5000>
  - User: `admin`
  - Password: `admin`

## Docs: How It Works

- https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_filters/compressor_filter#how-it-works

## Report

[Attack Scenario](./attacker/run.sh)

![Report 1](./docs/compression-result.png)

### Summary

#### Case 1: レスポンスの圧縮を envoy-proxy-pure、web の両方で実施しない場合

- レスポンスを圧縮せずにそのまま返す
- envoy-gateway、envoy-proxy-pure の両方で同じサイズを観測する

#### Case 2: レスポンスの圧縮を web で実施、envoy-proxy-pure で実施しない

- web で圧縮されたレスポンスはそのまま envoy-proxy-pure、envoy-gateway 両方で同じサイズを観測する

#### Case 3: レスポンスの圧縮を envoy-proxy-compression で実施、web で実施しない

- envoy-proxy-compression 到達時点で圧縮されていないことが観測される
- envoy-gateway では envoy-proxy-compression で圧縮されたレスポンスが観測される
- Case 2 の web と envoy-proxy-compression の圧縮設定がやや違うため圧縮率が違う

#### Case 4: レスポンスの圧縮を envoy-proxy-compression と web で実施

- envoy-proxy-compression 到達時点で圧縮されていることが観測される
- envoy-gateway では envoy-proxy-compression では圧縮は実施されずそのまま通過する

### Request Response の速度ランキング

| Rank | Request | Response |
| :--- | :------ | :------- |
| 1    | Case 1  | Case 1   |
| 2    | Case 3  | Case 3   |
| 3    | Case 4  | Case 4   |
| 4    | Case 2  | Case2    |

→ Case 2, 4はwebでの圧縮を実施するため、envoyを通す場合は圧縮しないほうが速くなる

### その他

- `Accept-Encoding: gzip`をつけなければ envoy の compression は実施されない

## TODO

- [ ] 圧縮率の計測
