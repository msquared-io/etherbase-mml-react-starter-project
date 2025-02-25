import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import Dice from "./Dice"
import Labels from "./Labels"
import Light from "./Light"
import { EtherbaseEvent, EtherbaseProvider, useEtherbaseEvents } from "@msquared/etherbase-client"

function App() {
  const sourceAddress = "0x2e30b662c4Df268edA9efce596CDF3896b50B43C"


  const [connectedClients, setConnectedClients] = useState(0)
  const [diceClickCount, setDiceClickCount] = useState(0)
  const [totalUptimeSeconds, setTotalUptimeSeconds] = useState(0)

  const [lastDiceRoll, setLastDiceRoll] = useState(0)

  const handleDiceRoll = useCallback((event: EtherbaseEvent) => {
    setLastDiceRoll(event.args["result"] as number)
  }, [])
  useEtherbaseEvents({contractAddress: sourceAddress, events: [{name: "DiceRoll"}], onEvent: handleDiceRoll})


  const onDiceClick = () => {
    setDiceClickCount((n) => n + 1)
  }

  const updateUptimeLabel = () => {
    // Get total document uptime
    // NOTE: document.timeline.currentTime reports uptime in ms
    if (!document.timeline.currentTime) return
    setTotalUptimeSeconds(
      Math.floor((document.timeline.currentTime as number) / 1000),
    )
  }

  useEffect(() => {
    updateUptimeLabel()
    const intervalId = setInterval(updateUptimeLabel, 1000)

    window.addEventListener("connected", () => {
      setConnectedClients((n) => n + 1)
    })
    window.addEventListener("disconnected", () => {
      setConnectedClients((n) => n - 1)
    })

    return () => {
      clearInterval(intervalId)

      window.removeEventListener("connected", () => {
        setConnectedClients((n) => n + 1)
      })
      window.removeEventListener("disconnected", () => {
        setConnectedClients((n) => n - 1)
      })
    }
  }, [])

  const uptimeMinutes = Math.floor(totalUptimeSeconds / 60)
  const uptimeSeconds = totalUptimeSeconds - uptimeMinutes * 60
  const uptimeLabelText =
    uptimeMinutes > 0
      ? `${uptimeMinutes}:${String(uptimeSeconds).padStart(2, "0")}`
      : `${uptimeSeconds}s`

  return (
    <>
      <Light />
      <Labels
        connectedText={`Connected clients: ${connectedClients}`}
        rollsText={`Dice clicks: ${diceClickCount}`}
        uptimeText={`Uptime: ${uptimeLabelText}`}
        lastDiceRollText={`Last Dice Roll (Etherbase): ${lastDiceRoll}`}
      />
      <Dice onClick={onDiceClick} sourceAddress={sourceAddress}/>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById("root")!
const root = createRoot(container)
flushSync(() => {
  root.render(
    <EtherbaseProvider
      config={{
        httpReaderUrl:
          "https://etherbase-reader-496683047294.europe-west2.run.app",
        wsReaderUrl: "wss://etherbase-reader-496683047294.europe-west2.run.app",
        wsWriterUrl: "wss://etherbase-writer-496683047294.europe-west2.run.app",
        privateKey:
          "0x47932392b286615db534bcf486ab502e7c8a898c7ada96a7b0c87aa460913cdf",
        useBackend: true,
      }}
    >
      <App />
    </EtherbaseProvider>,
  )
})
