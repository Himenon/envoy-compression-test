import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

export const stringify = (value: any): string => yaml.dump(value, { noRefs: true, lineWidth: 144 });

const writeFile = (filename: string, data: any) => {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, stringify(data), "utf-8");
  console.log(`Generate: ${filename}`);
};

interface Option {
  compression: boolean;
}

const createConfig = (option: Option) => {
  const admin = {
    address: {
      socket_address: {
        address: "0.0.0.0",
        port_value: 9090,
      },
    },
  };

  const clusters = [
    {
      name: "web_cluster",
      type: "STRICT_DNS",
      lb_policy: "ROUND_ROBIN",
      load_assignment: {
        cluster_name: "web_cluster",
        endpoints: [
          {
            lb_endpoints: [
              {
                endpoint: {
                  address: {
                    socket_address: {
                      address: "web",
                      port_value: 80,
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ];

  /**
   * @see https://www.envoyproxy.io/docs/envoy/v1.19.0/api-v3/extensions/filters/http/compressor/v3/compressor.proto.html
   */
  const compressorFilter = {
    name: "envoy.filters.http.compressor",
    typed_config: {
      "@type": "type.googleapis.com/envoy.extensions.filters.http.compressor.v3.Compressor",
      response_direction_config: {
        common_config: {
          min_content_length: 100,
          enabled: {
            default_value: true,
            runtime_key: "response_compressor_enabled",
          },
          content_type: ["text/html", "application/json", "text/css", "application/javascript"],
        },
        disable_on_etag_header: true,
      },
      request_direction_config: {
        common_config: {
          enabled: {
            default_value: false,
            runtime_key: "request_compressor_enabled",
          },
        },
      },
      compressor_library: {
        name: "for_response",
        typed_config: {
          "@type": "type.googleapis.com/envoy.extensions.compression.gzip.compressor.v3.Gzip",
          /**
           * 1-9間。Memをたくさん使って高圧縮になる
           */
          memory_level: 9,
          /**
           * メモリ使用量を犠牲にして高圧縮になる
           */
          window_bits: 12,
          /**
           * BEST_COMPRESSION ... 遅いくせになんか圧縮率も悪い気がする
           * BEST_SPEED       ... 最速でやる
           */
          compression_level: "BEST_SPEED",
          compression_strategy: "DEFAULT_STRATEGY",
        },
      },
    },
  };
  let http_filters = [
    {
      name: "envoy.filters.http.router",
    },
  ];

  if (option.compression) {
    http_filters = [compressorFilter, ...http_filters];
  }

  const static_resources = {
    listeners: [
      {
        name: "main",
        address: {
          socket_address: {
            address: "0.0.0.0",
            port_value: 8000,
          },
        },
        filter_chains: [
          {
            filters: [
              {
                name: "envoy.filters.network.http_connection_manager",
                typed_config: {
                  "@type": "type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager",
                  stat_prefix: "ingress_http",
                  codec_type: "AUTO",
                  access_log: [
                    {
                      name: "envoy.file_access_log",
                      typed_config: {
                        "@type": "type.googleapis.com/envoy.extensions.access_loggers.file.v3.FileAccessLog",
                        path: "/dev/stdout",
                      },
                    },
                  ],
                  route_config: {
                    name: "local_route",
                    virtual_hosts: [
                      {
                        name: "local_service",
                        domains: ["*"],
                        routes: [
                          {
                            match: {
                              prefix: "/",
                            },
                            route: {
                              cluster: "web_cluster",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  http_filters: http_filters,
                },
              },
            ],
          },
        ],
      },
    ],
    clusters: clusters,
  };

  const config = {
    admin: admin,
    static_resources: static_resources,
  };
  return config;
};

writeFile(path.join("envoy-proxy-pure", "envoy.yaml"), createConfig({ compression: false }));
writeFile(path.join("envoy-proxy-compression", "envoy.yaml"), createConfig({ compression: true }));
