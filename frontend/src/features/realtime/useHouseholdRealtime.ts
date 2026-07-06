import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { getHubConnection } from "@/lib/signalr"
import { RealtimeEvents } from "./realtimeEvents"
import { handleRealtimeEvent } from "./invalidations"

export function useHouseholdRealtime() {
  const qc = useQueryClient()

  useEffect(() => {
    const conn = getHubConnection()
    const handlers = Object.values(RealtimeEvents).map(event => {
      const cb = (payload: unknown) => handleRealtimeEvent(qc, event, payload)
      conn.on(event, cb)
      return { event, cb }
    })

    if (conn.state === "Disconnected") {
      conn.start().catch(err => {
        console.error("SignalR connect failed", err)
      })
    }

    return () => {
      for (const { event, cb } of handlers) conn.off(event, cb)
    }
  }, [qc])
}
