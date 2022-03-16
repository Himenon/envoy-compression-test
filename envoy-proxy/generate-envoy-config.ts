import * as yaml from "js-yaml";
import * as fs from "fs";
import * as path from "path";

export const stringify = (value: any): string => yaml.dump(value, { noRefs: true, lineWidth: 144 });

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
        memory_level: 1,
        window_bits: 12,
        compression_level: "BEST_SPEED",
        compression_strategy: "DEFAULT_STRATEGY",
      },
    },
  },
};

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
                            path: "/ping",
                          },
                          route: {
                            cluster: "web_cluster",
                          },
                        },
                      ],
                    },
                    {
                      name: "local_service",
                      domains: ["*"],
                      routes: [
                        {
                          match: {
                            path: "/envoy-proxy-gzip",
                          },
                          route: {
                            cluster: "web_cluster",
                          },
                        },
                      ],
                      typed_per_filter_config: {
                        [compressorFilter.name]: compressorFilter.typed_config,
                      },
                    },
                    {
                      name: "local_service",
                      domains: ["*"],
                      routes: [
                        {
                          match: {
                            path: "/upstream-gzip",
                          },
                          route: {
                            cluster: "web_cluster",
                          },
                        },
                      ],
                    },
                  ],
                },
                http_filters: [
                  // compressorFilter, // Global Filter
                  {
                    name: "envoy.filters.http.router",
                  },
                ],
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

fs.writeFileSync(path.join(__dirname, "envoy.yaml"), stringify(config), "utf-8");