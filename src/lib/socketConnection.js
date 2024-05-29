import { Connection } from "@iobroker/socket-client";

export const socketConnection = new Connection({
  protocol: "ws",
  host: process.env.NEXT_PUBLIC_SOCKET_URL,
  port: process.env.NEXT_PUBLIC_SOCKET_PORT,
  admin5only: false,
});

export async function connectSocket(connection) {
  await connection.startSocket();
  await connection.waitForFirstConnection();
  return connection;
}
