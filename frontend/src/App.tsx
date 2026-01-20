import React, { useState, useEffect } from 'react'
import { Settings, Brain, Save } from 'lucide-react'
import ExcelImporter from '@/components/ExcelImporter'
import ScrollingTable, { PlaybackSettings } from '@/components/ScrollingTable'
import FullscreenPlayer from '@/components/FullscreenPlayer'
import { ExcelData } from '@/hooks/useExcelReader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AppSettings {
  qianwenApiKey: string
}

function App() {
  const [excelData, setExcelData] = useState<ExcelData | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [displayTitle, setDisplayTitle] = useState('')
  const [fullscreenSettings, setFullscreenSettings] = useState<PlaybackSettings>({
    speed: 0.5,
    fontSize: 14,
    rowHeight: 48,
    titleFontSize: 24,
    backgroundColor: '#1a1a1a',
    tableFrameColor: '#ff6b35',
    textColor: '#ffffff'
  })
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    qianwenApiKey: ''
  })
  const [aiInsight, setAiInsight] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleDataLoaded = (data: ExcelData | null) => {
    setExcelData(data)
    if (data) {
      const savedTitle = localStorage.getItem(`title_${data.fileName}`)
      if (savedTitle) {
        setDisplayTitle(savedTitle)
      } else {
        setDisplayTitle('这里修改您的标题内容')
      }
    } else {
      setDisplayTitle('')
    }
  }

  const handleFullscreen = (settings: PlaybackSettings) => {
    setFullscreenSettings(settings)
    setIsFullscreen(true)
  }

  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
  }

  const handleTitleChange = (newTitle: string) => {
    setDisplayTitle(newTitle)
    if (excelData) {
      localStorage.setItem(`title_${excelData.fileName}`, newTitle)
    }
  }

  const saveSettings = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    alert('设置已保存')
  }

  const analyzeData = async () => {
    if (!excelData || !settings.qianwenApiKey) {
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
            headers: excelData.headers,
            rows: excelData.rows.slice(0, 10)
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>系统设置</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">千问API Key</label>
                <Input
                  type="password"
                  value={settings.qianwenApiKey}
                  onChange={(e) => setSettings({ ...settings, qianwenApiKey: e.target.value })}
                  placeholder="sk-..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  从阿里云控制台获取API Key，用于AI数据分析功能
                </p>
              </div>

              <Button onClick={saveSettings} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>保存设置</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ExcelImporter onDataLoaded={handleDataLoaded} />

          {excelData && (
            <>
              {/* AI数据分析 */}
              {settings.qianwenApiKey && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-accent-purple" />
                        <span>AI数据分析</span>
                      </div>
                      <Button
                        onClick={analyzeData}
                        disabled={isAnalyzing}
                        size="sm"
                        className="bg-accent-purple hover:bg-accent-purple/90"
                      >
                        {isAnalyzing ? '分析中...' : '开始分析'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  {aiInsight && (
                    <CardContent>
                      <div className="p-4 glass-effect rounded-lg border border-accent-purple/30">
                        <p className="text-gray-300 whitespace-pre-wrap">{aiInsight}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* 滚屏表格 */}
              <ScrollingTable
                data={excelData}
                onFullscreen={handleFullscreen}
                displayTitle={displayTitle}
                onTitleChange={handleTitleChange}
              />
            </>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-16 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p className="mb-2">
            本项目由
            <a
              href="https://www.aliyun.com/product/esa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-cyan hover:underline mx-1"
            >
              阿里云ESA
            </a>
            提供加速、计算和保护
          </p>
          <img
            src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png"
            alt="阿里云ESA"
            className="h-8 mx-auto mt-2"
          />
        </div>
      </footer>

      {/* 全屏播放器 */}
      {excelData && (
        <FullscreenPlayer
          data={excelData}
          isVisible={isFullscreen}
          onClose={handleCloseFullscreen}
          displayTitle={displayTitle}
          onTitleChange={handleTitleChange}
          initialSettings={fullscreenSettings}
        />
      )}
    </div>
  )
}

export default App
