import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings, Maximize, Edit3, Check, X, Save, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ExcelData } from '@/hooks/useExcelReader'

interface ScrollingTableProps {
  data: ExcelData
  onFullscreen: (settings: PlaybackSettings) => void
  displayTitle: string
  onTitleChange: (title: string) => void
}

export interface PlaybackSettings {
  speed: number
  fontSize: number
  rowHeight: number
  titleFontSize: number
  backgroundColor: string
  tableFrameColor: string
  textColor: string
}

const ScrollingTable: React.FC<ScrollingTableProps> = ({
  data,
  onFullscreen,
  displayTitle,
  onTitleChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.5)
  const [showSettings, setShowSettings] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [rowHeight, setRowHeight] = useState(52)
  const [titleFontSize, setTitleFontSize] = useState(28)
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a')
  const [tableFrameColor, setTableFrameColor] = useState('#ff6b35')
  const [textColor, setTextColor] = useState('#ffffff')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(displayTitle)
  const [titleSaved, setTitleSaved] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // 预设颜色
  const backgroundPresets = [
    '#0a0a0a', '#1a1a1a', '#2a2a2a', '#1e293b', '#334155',
    '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'
  ]

  const frameColorPresets = [
    '#ff6b35', '#00e5cc', '#a855f7', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
  ]

  const textColorPresets = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
    '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b'
  ]

  useEffect(() => {
    setTempTitle(displayTitle)
  }, [displayTitle])

  useEffect(() => {
    if (isPlaying) {
      setShowSettings(false)
      setIsEditingTitle(false)
    } else {
      setShowSettings(true)
    }
  }, [isPlaying])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const startScrolling = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const maxScroll = scrollHeight - clientHeight

    const animate = () => {
      if (!isPlaying) return

      const currentContainer = scrollContainerRef.current
      if (!currentContainer) return

      setScrollPosition(prev => {
        let newPosition = prev + speed

        if (newPosition >= maxScroll + clientHeight) {
          newPosition = -clientHeight
        }

        currentContainer.scrollTop = Math.max(0, newPosition)
        return newPosition
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const stopScrolling = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }
  }

  const resetScroll = () => {
    setScrollPosition(0)
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTop = 0
    }
  }

  useEffect(() => {
    if (isPlaying) {
      startScrolling()
    } else {
      stopScrolling()
    }

    return () => stopScrolling()
  }, [isPlaying, speed])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    resetScroll()
  }

  const handleFullscreen = () => {
    const currentSettings: PlaybackSettings = {
      speed,
      fontSize,
      rowHeight,
      titleFontSize,
      backgroundColor,
      tableFrameColor,
      textColor
    }
    onFullscreen(currentSettings)
  }

  const handleTitleEdit = () => {
    setIsEditingTitle(true)
    setTitleSaved(false)
  }

  const handleTitleSave = () => {
    const trimmedTitle = tempTitle.trim()
    onTitleChange(trimmedTitle)
    setTitleSaved(true)
    setIsEditingTitle(false)
    setTimeout(() => setTitleSaved(false), 2000)
  }

  const handleTitleCancel = () => {
    setTempTitle(displayTitle)
    setIsEditingTitle(false)
    setTitleSaved(false)
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleTitleCancel()
    }
  }

  const getCellStyle = (rowIndex: number, colIndex: number) => {
    if (!data.styles || !data.styles[rowIndex + 1] || !data.styles[rowIndex + 1][colIndex]) {
      return { color: textColor }
    }

    const cellStyle = data.styles[rowIndex + 1][colIndex]
    const style: React.CSSProperties = {}

    if (cellStyle.font) {
      if (cellStyle.font.bold) {
        style.fontWeight = 'bold'
      }
      if (cellStyle.font.color && cellStyle.font.color.rgb) {
        style.color = `#${cellStyle.font.color.rgb}`
      } else {
        style.color = textColor
      }
      if (cellStyle.font.italic) {
        style.fontStyle = 'italic'
      }
    } else {
      style.color = textColor
    }

    if (cellStyle.fill && cellStyle.fill.bgColor && cellStyle.fill.bgColor.rgb) {
      style.backgroundColor = `#${cellStyle.fill.bgColor.rgb}`
    }

    if (cellStyle.alignment) {
      if (cellStyle.alignment.horizontal) {
        style.textAlign = cellStyle.alignment.horizontal
      }
      if (cellStyle.alignment.vertical) {
        style.verticalAlign = cellStyle.alignment.vertical
      }
    }

    return style
  }

  const getHeaderStyle = (colIndex: number) => {
    if (!data.styles || !data.styles[0] || !data.styles[0][colIndex]) {
      return {
        color: textColor,
        backgroundColor: tableFrameColor,
        fontWeight: 'bold'
      }
    }

    const cellStyle = data.styles[0][colIndex]
    const style: React.CSSProperties = {
      backgroundColor: tableFrameColor,
      fontWeight: 'bold'
    }

    if (cellStyle.font) {
      if (cellStyle.font.bold) {
        style.fontWeight = 'bold'
      }
      if (cellStyle.font.color && cellStyle.font.color.rgb) {
        style.color = `#${cellStyle.font.color.rgb}`
      } else {
        style.color = '#ffffff'
      }
      if (cellStyle.font.italic) {
        style.fontStyle = 'italic'
      }
    } else {
      style.color = '#ffffff'
    }

    if (cellStyle.alignment) {
      if (cellStyle.alignment.horizontal) {
        style.textAlign = cellStyle.alignment.horizontal
      }
      if (cellStyle.alignment.vertical) {
        style.verticalAlign = cellStyle.alignment.vertical
      }
    }

    return style
  }

  const repeatedRows = [...data.rows, ...data.rows, ...data.rows, ...data.rows, ...data.rows]

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            表格滚屏播放 - {data.fileName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              disabled={isPlaying}
            >
              <Settings className="h-4 w-4" />
              {showSettings ? '隐藏设置' : '显示设置'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
            >
              <Maximize className="h-4 w-4" />
              全屏播放
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="space-y-6 mt-4">
            {/* 播放设置 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 glass-effect rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">滚动速度</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-400">{speed}px/frame</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">字体大小</label>
                <input
                  type="range"
                  min="12"
                  max="28"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-400">{fontSize}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">行高</label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="4"
                  value={rowHeight}
                  onChange={(e) => setRowHeight(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-400">{rowHeight}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">标题字体大小</label>
                <input
                  type="range"
                  min="20"
                  max="56"
                  step="2"
                  value={titleFontSize}
                  onChange={(e) => setTitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm text-gray-400">{titleFontSize}px</span>
              </div>
            </div>

            {/* 颜色调整 */}
            <div className="p-4 glass-effect rounded-lg border border-accent-cyan/30">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-accent-cyan">
                <Palette className="h-5 w-5" />
                界面颜色调整
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">背景底色</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-gray-400">{backgroundColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {backgroundPresets.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${backgroundColor === color ? 'border-accent-cyan' : 'border-gray-600'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setBackgroundColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">表格边框颜色</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={tableFrameColor}
                      onChange={(e) => setTableFrameColor(e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-gray-400">{tableFrameColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {frameColorPresets.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${tableFrameColor === color ? 'border-accent-cyan' : 'border-gray-600'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTableFrameColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">文字颜色</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-gray-400">{textColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {textColorPresets.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 ${textColor === color ? 'border-accent-cyan' : 'border-gray-600'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setTextColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-6">
          <Button onClick={togglePlay} size="sm">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? '暂停' : '播放'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
            重置
          </Button>
        </div>

        {/* 表格容器 */}
        <div
          className="rounded-lg overflow-hidden border-2"
          style={{
            backgroundColor,
            borderColor: tableFrameColor
          }}
        >
          {/* 标题区域 */}
          <div
            className="px-6 py-2 text-center border-b-2"
            style={{
              backgroundColor,
              borderBottomColor: tableFrameColor
            }}
          >
            {isEditingTitle ? (
              <div className="flex items-center justify-center gap-2">
                <Input
                  ref={titleInputRef}
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleTitleKeyPress}
                  className="text-center max-w-4xl border-2"
                  style={{
                    fontSize: `${titleFontSize}px`,
                    color: textColor,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: tableFrameColor,
                    fontWeight: 'bold'
                  }}
                  placeholder="请输入标题"
                />
                <Button
                  onClick={handleTitleSave}
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4" />
                  保存
                </Button>
                <Button
                  onClick={handleTitleCancel}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                  取消
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2
                  className="font-bold cursor-pointer hover:bg-white/10 px-4 py-1 rounded-lg transition-colors min-h-[2.5rem] flex items-center text-center leading-tight"
                  style={{
                    fontSize: `${titleFontSize}px`,
                    color: textColor,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                    letterSpacing: '0.5px'
                  }}
                  onClick={handleTitleEdit}
                  title="点击编辑标题"
                >
                  {displayTitle || '点击编辑标题'}
                </h2>
                <Button
                  onClick={handleTitleEdit}
                  size="sm"
                  variant="ghost"
                  className="opacity-60 hover:opacity-100"
                  title="编辑标题"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                {titleSaved && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <Check className="h-4 w-4" />
                    已保存
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 表格内容 */}
          <div
            ref={scrollContainerRef}
            className="overflow-hidden scrollbar-hide"
            style={{
              fontSize: `${fontSize}px`,
              backgroundColor,
              height: '384px'
            }}
          >
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr>
                  {data.headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left font-bold border-r-2 last:border-r-0"
                      style={{
                        height: `${rowHeight}px`,
                        borderColor: '#ffffff',
                        ...getHeaderStyle(index)
                      }}
                    >
                      {header || `列${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {repeatedRows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b-2 hover:bg-opacity-80 transition-colors"
                    style={{
                      borderColor: tableFrameColor,
                      backgroundColor: rowIndex % 2 === 0 ? backgroundColor : `${backgroundColor}dd`
                    }}
                  >
                    {data.headers.map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-3 border-r border-gray-700 last:border-r-0"
                        style={{
                          height: `${rowHeight}px`,
                          ...getCellStyle(rowIndex % data.rows.length, colIndex)
                        }}
                      >
                        {row[colIndex] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ScrollingTable
