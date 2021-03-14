export type ShuffleData = {
  columns: Record<string, string>
  rows: Record<string, string[]>
  shuffleKey: string
}

export type ColumnsType = {
  [key: string]: string
}

export type RowsType = {
  [key: string]: string[]
}
