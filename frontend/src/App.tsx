import React, { useState, useEffect } from 'react'
import { Upload, Settings, Play, Pause, RotateCcw, Maximize2, Brain, Save } from 'lucide-react'
import * as XLSX from 'xlsx'

interface TableData {
  headers: string[]
  rows: string[][]
  fileName: string
}

interface AppSettings {
  qianwenApiKey: string
  scrollSpeed: number
  fontSize: number
  backgroundColor: string
  textColor: string
}

function App() {
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    qianwenApiKey: '',
    scrollSpeed: 50,
    fontSize: 16,
    backgroundColor: '#0a0a0a',
    textColor: '#ffffff'
  })
  const [aiInsight, setAiInsight] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][]

      if (jsonData.length > 0) {
        setTableData({
          headers: jsonData[0],
          rows: jsonData.slice(1),
          fileName: file.name
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    alert('设置已保存')
  }

  const analyzeData = async () => {
    if (!tableData || !settings.qianwenApiKey) {
      alert('请先上传数据并配置千问API Key')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.qianwenApiKey,
          data: {
            headers: tableData.headers,
            rows: tableData.rows.slice(0, 10)
          }
        })
      })

      const result = await response.json()
      setAiInsight(result.insight || '分析失败')
    } catch (error) {
      setAiInsight('分析出错: ' + (error as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100">
      {/* 顶部导航 */}
      <nav className="glass-effect border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-cyan rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">ST</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">智能表格展示</h1>
                <p className="text-xs text-gray-400">Smart Table Display</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="glass-effect px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10 transition-all flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">上传Excel</span>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="glass-effect p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 设置面板 */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="glass-effect rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>系统设置</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">千问API Key</label>
                <input
                  type="password"
                  value={settings.qianwenApiKey}
                  onChange={(e) => setSettings({ ...settings, qianwenApiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-dark-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">滚动速度: {settings.scrollSpeed}px/s</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={settings.scrollSpeed}
                  onChange={(e) => setSettings({ ...settings, scrollSpeed: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">字体大小: {settings.fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">背景颜色</label>
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="bg-accent-cyan text-dark-900 px-6 py-2 rounded-lg font-medium hover:bg-accent-cyan/90 transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>保存设置</span>
            </button>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!tableData ? (
          <div className="glass-effect rounded-xl p-12 text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-accent-cyan" />
            <h2 className="text-2xl font-bold mb-2">上传Excel文件开始</h2>
            <p className="text-gray-400 mb-6">支持 .xlsx 和 .xls 格式</p>
            <label className="inline-block bg-gradient-to-r from-accent-orange to-accent-cyan text-white px-8 py-3 rounded-lg cursor-pointer hover:opacity-90 transition-all font-medium">
              选择文件
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 控制栏 */}
            <div className="glass-effect rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-accent-cyan text-dark-900 px-4 py-2 rounded-lg font-medium hover:bg-accent-cyan/90 transition-all flex items-center space-x-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? '暂停' : '播放'}</span>
                </button>

                <button className="glass-effect px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>重置</span>
                </button>

                <button className="glass-effect px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center space-x-2">
                  <Maximize2 className="w-4 h-4" />
                  <span>全屏</span>
                </button>
              </div>

              <button
                onClick={analyzeData}
                disabled={isAnalyzing}
                className="bg-accent-purple text-white px-4 py-2 rounded-lg font-medium hover:bg-accent-purple/90 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Brain className="w-4 h-4" />
                <span>{isAnalyzing ? '分析中...' : 'AI数据分析'}</span>
              </button>
            </div>

            {/* AI洞察 */}
            {aiInsight && (
              <div className="glass-effect rounded-xl p-6 border border-accent-purple/30">
                <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-accent-purple" />
                  <span>AI数据洞察</span>
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap">{aiInsight}</p>
              </div>
            )}

            {/* 表格展示 */}
            <div className="glass-effect rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold">{tableData.fileName}</h3>
                <p className="text-sm text-gray-400">{tableData.rows.length} 行数据</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontSize: `${settings.fontSize}px` }}>
                  <thead className="bg-white/5">
                    <tr>
                      {tableData.headers.map((header, i) => (
                        <th key={i} className="px-6 py-3 text-left font-semibold border-b border-white/10">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-6 py-3">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="mt-16 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p className="mb-2">本项目由<a href="https://www.aliyun.com/product/esa" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">阿里云ESA</a>提供加速、计算和保护</p>
          <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="阿里云ESA" className="h-8 mx-auto mt-2" />
        </div>
      </footer>
    </div>
  )
}

export default App
