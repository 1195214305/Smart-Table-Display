import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'

export interface ExcelData {
  headers: string[]
  rows: string[][]
  fileName: string
  styles?: any[][]
}

export const useExcelReader = () => {
  const [data, setData] = useState<ExcelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const readExcelFile = useCallback((file: File) => {
    setLoading(true)
    setError(null)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, {
          type: 'binary',
          cellStyles: true,
          cellHTML: false
        })

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

        if (jsonData.length === 0) {
          setError('Excel文件为空')
          setLoading(false)
          return
        }

        const headers = jsonData[0] || []
        const rows = jsonData.slice(1)

        // 提取样式信息
        const styles: any[][] = []
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

        for (let R = range.s.r; R <= range.e.r; ++R) {
          const rowStyles: any[] = []
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
            const cell = worksheet[cellAddress]

            if (cell && cell.s) {
              rowStyles[C] = {
                font: cell.s.font || {},
                fill: cell.s.fill || {},
                alignment: cell.s.alignment || {}
              }
            } else {
              rowStyles[C] = {}
            }
          }
          styles[R] = rowStyles
        }

        setData({
          headers,
          rows,
          fileName: file.name,
          styles
        })

        setLoading(false)
      } catch (err) {
        setError('读取Excel文件失败，请确保文件格式正确')
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setError('文件读取失败')
      setLoading(false)
    }

    reader.readAsBinaryString(file)
  }, [])

  const clearData = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return {
    data,
    loading,
    error,
    readExcelFile,
    clearData
  }
}
