import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr"
import { apiBaseUrl, getAccessToken } from "@/lib/api"

let connection: HubConnection | null = null

export function getHubConnection(): HubConnection {
  if (connection) return connection
  connection = new HubConnectionBuilder()
    .withUrl(`${apiBaseUrl}/hubs/household`, {
      accessTokenFactory: async () => (await getAccessToken()) ?? ""
    })
    .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
    .configureLogging(LogLevel.Warning)
    .build()
  return connection
}

export async function stopHub() {
  const c = connection
  connection = null
  if (c && c.state !== "Disconnected") await c.stop()
}
