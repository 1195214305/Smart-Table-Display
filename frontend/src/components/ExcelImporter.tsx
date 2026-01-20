import React, { useRef } from 'react'
import { Upload, FileSpreadsheet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useExcelReader } from '@/hooks/useExcelReader'

interface ExcelImporterProps {
  onDataLoaded: (data: any) => void
}

const ExcelImporter: React.FC<ExcelImporterProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data, loading, error, readExcelFile, clearData } = useExcelReader()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ]

      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        alert('请选择有效的Excel文件（.xlsx, .xls, .csv）')
        return
      }

      readExcelFile(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearData = () => {
    clearData()
    onDataLoaded(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  React.useEffect(() => {
    if (data) {
      onDataLoaded(data)
    }
  }, [data, onDataLoaded])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-accent-cyan" />
          Excel文件导入
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!data ? (
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center hover:border-accent-cyan transition-colors">
            <Upload className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-300 mb-4 text-lg">
              点击上传或拖拽Excel文件到此处
            </p>
            <p className="text-sm text-gray-500 mb-6">
              支持 .xlsx, .xls, .csv 格式
            </p>
            <Button onClick={handleUploadClick} disabled={loading} size="lg">
              {loading ? '读取中...' : '选择文件'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-accent-cyan" />
                <div>
                  <p className="font-medium text-accent-cyan">{data.fileName}</p>
                  <p className="text-sm text-gray-400">
                    {data.headers.length} 列，{data.rows.length} 行数据
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-60 overflow-auto border border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-white/5 sticky top-0">
                  <tr>
                    {data.headers.map((header: string, index: number) => (
                      <th key={index} className="px-4 py-3 text-left font-medium border-b border-gray-700">
                        {header || `列${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.slice(0, 5).map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex} className="border-b border-gray-800 hover:bg-white/5">
                      {data.headers.map((_: string, colIndex: number) => (
                        <td key={colIndex} className="px-4 py-2">
                          {row[colIndex] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.rows.length > 5 && (
                <div className="p-3 text-center text-sm text-gray-500 bg-white/5">
                  还有 {data.rows.length - 5} 行数据...
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ExcelImporter
