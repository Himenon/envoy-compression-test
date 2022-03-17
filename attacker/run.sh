#!/bin/bash

echo "Case 1"
echo "# Request  : envoy-gateway:8000 --------> envoy-proxy-pure:8000 --------> web:80"
echo "# Response : envoy-gateway:8000 <-------- envoy-proxy-pure:8000 <-------- web:80"
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: pure" > /dev/null

sleep 5

echo "Case 2"
echo "# Request  : envoy-gateway:8000 --------> envoy-proxy-pure:8000 --------> web:80"
echo "# Response : envoy-gateway:8000 <-------- envoy-proxy-pure:8000 <-(gzip)- web:80"
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: pure" -header "web-compression: true" -header "accept-encoding: gzip" > /dev/null

sleep 5

echo "Case 3"
echo "# Request  : envoy-gateway:8000 --------> envoy-proxy-compression:8000 --------> web:80"
echo "# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-compression:8000 <-------- web:80"
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: compression" -header "accept-encoding: gzip" > /dev/null

sleep 5

echo "Case 4"
echo "# Request  : envoy-gateway:8000 --------> envoy-proxy-compression:8000 --------> web:80"
echo "# Response : envoy-gateway:8000 <-(gzip)- envoy-proxy-compression:8000 <-(gzip)- web:80"
echo "GET http://envoy-gateway:8000" | ./vegeta attack -rate 1/1s -header "target-proxy: compression" -header "web-compression: true" -header "accept-encoding: gzip" > /dev/null

echo "finsihed"
