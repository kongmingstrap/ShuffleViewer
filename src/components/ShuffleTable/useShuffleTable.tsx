import { useCallback, useEffect, useState } from "react"

import arrayShuffle from "array-shuffle"
import { ReactSoundProps } from "react-sound"

import { ShuffleData } from "../../domains/ShuffleData"
import shuffle from "./shuffle.json"

const shuffleSound = `${process.env.PUBLIC_URL}/shuffle.mp3`

export interface TableProps {
  columns: string[]
  rows: string[][]
}

export interface UseShuffleTableInterface {
  table: TableProps
  shuffling: boolean
  shuffleKeyIndex: number
  soundProps: ReactSoundProps
  takeShuffle: () => void
}

export const useShuffleTable = (): UseShuffleTableInterface => {
  const [shuffling, setShuffling] = useState(false)
  const shuffleData: ShuffleData = JSON.parse(JSON.stringify(shuffle))
  const [shuffledRows, setShuffledRows] = useState(
    Object.keys(shuffleData.rows).map((key) => shuffleData.rows[key])
  )
  const [soundProps, setSoundProps] = useState({
    url: shuffleSound,
    playStatus: 'STOPPED',
    loop: false,
    volume: 30,
  } as ReactSoundProps)

  const columns = Object.values(shuffleData.columns)
  const rows = shuffledRows[0].map((_, idx) => {
    return shuffledRows.map((v) => v[idx])
  })
  const shuffleKeyIndex = Object.keys(shuffleData.rows).indexOf(shuffleData.shuffleKey)

  const shuffleRows = useCallback(() => {
    const rows = Object.keys(shuffleData.rows).map((key) => {
      return (key === shuffleData.shuffleKey) ?
        arrayShuffle(shuffleData.rows[key]) : shuffleData.rows[key]
      })
    setShuffledRows(rows)
  }, [shuffleData])

  const takeShuffle = useCallback(() => {
    if (!shuffling) {
      setShuffling(true)
      setSoundProps({ ...soundProps, playStatus: 'PLAYING' })
    } else {
      setShuffling(false)
      // If there is a fixed row
      if (shuffleData.fixedRows !== undefined && shuffleData.fixedRows.length > 0) {
        shuffleData.fixedRows.forEach((row) => {
          // Swap
          const rawIndex = shuffleData.rows[shuffleData.shuffleKey].indexOf(row)
          const nowIndex = shuffledRows[shuffleKeyIndex].indexOf(row)
          const tmpData = shuffledRows[shuffleKeyIndex][rawIndex]
          shuffledRows[shuffleKeyIndex][rawIndex] = shuffledRows[shuffleKeyIndex][nowIndex]
          shuffledRows[shuffleKeyIndex][nowIndex] = tmpData
        })
      }
      setSoundProps({ ...soundProps, playStatus: 'STOPPED' })
    }
  }, [shuffleData, shuffleKeyIndex, shuffledRows, shuffling, soundProps])

  useEffect(() => {
    const timer = setTimeout(() => {
      shuffleRows()
    }, 100)
    if (!shuffling) {
      clearTimeout(timer)
    }
    return () => clearTimeout(timer)
  }, [shuffling, shuffleRows])

  return {
    table: { columns, rows },
    shuffling,
    shuffleKeyIndex,
    soundProps: soundProps,
    takeShuffle: takeShuffle
  }
}
