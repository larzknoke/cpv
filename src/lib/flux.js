import { InfluxDB } from "@influxdata/influxdb-client";

const client = new InfluxDB({
  url: process.env.NEXT_PUBLIC_INFLUX_URL,
  token: process.env.NEXT_PUBLIC_INFLUX_TOKEN,
});
export const queryClient = client.getQueryApi(
  process.env.NEXT_PUBLIC_INFLUX_ORG
);
