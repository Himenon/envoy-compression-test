#!/bin/sh

rm -rf vegeta workdir vegeta_12.8.4_linux_amd64.tar.gz

wget https://github.com/tsenart/vegeta/releases/download/v12.8.4/vegeta_12.8.4_linux_amd64.tar.gz

mkdir -p workdir
tar xzvf vegeta_12.8.4_linux_amd64.tar.gz -C workdir
mv workdir/vegeta ./
chmod +x vegeta

rm -rf workdir vegeta_12.8.4_linux_amd64.tar.gz
