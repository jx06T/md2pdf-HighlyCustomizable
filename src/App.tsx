import { useEffect, useRef, useState, Suspense } from 'react'
import React from 'react';

import './App.css'
import './uiw/react-md-editor/dist/mdeditor.css'

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { JamChevronCircleUp, JamChevronCircleDown, TdesignLogoGithubFilled, MaterialSymbolsDocsOutlineRounded } from "./utils/Icons"
import { MdProvider } from './context/MdContext'
import UpperToolbar from './components/UpperToolbar'
import DocsPage from './pages/DocsPage'



// 組件 Props 類型定義
interface EditorAreaProps {
  expandLevel: number
  width: number
}

interface SetAreaProps {
  displayId: number
  expandLevel: number
  width: number
}

interface PreviewAreaProps {
  width: number
  expandLevel: number
  displayId: number
  initMdValue?: string
}

// Lazy 載入組件
const EditorArea = React.lazy(() => import('./components/EditorArea') as Promise<{ default: React.ComponentType<EditorAreaProps> }>)
const SetArea = React.lazy(() => import('./components/SetArea') as Promise<{ default: React.ComponentType<SetAreaProps> }>)
const PreviewArea = React.lazy(() => import('./components/PreviewArea') as Promise<{ default: React.ComponentType<PreviewAreaProps> }>)

// Loading 組件
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin full h-8 w-8 border-b-2 border-t-2 border-gray-900"></div>
  </div>
)

function App() {
  // State 
  const [editorAreaW, setEditorAreaW] = useState<number>(350)
  const [editorAndSetAreaW, setEditorAndSetAreaW] = useState<number>(650)
  const [isResizing, setIsResizing] = useState<boolean>(false)
  const [shouldShowHeader, setShouldShowHeader] = useState<boolean>(true)

  // (E for Editor W for Width)
  const startXRef = useRef<number>(0)
  const movingRef = useRef<number>(-1)
  const startEWRef = useRef<number>(0)
  const startESWRef = useRef<number>(0)

  const [minW] = useState<number>(192)
  const [maxW, setMaxW] = useState<number>(document.documentElement.clientWidth)
  const [expandLevel, setExpandLevel] = useState<number>(2)
  const [maxExpandLevel, setMaxExpandLevel] = useState<number>(2)
  const [customExpandLevel, setCustomExpandLevel] = useState<number>(2)

  // 展開等級 0:全收縮 1:展開預覽區 2:展開樣式設定區
  const [displayId, setDisplayId] = useState<number>(0)
  const [isInit, setIsInit] = useState<boolean>(true)


  useEffect(() => {
    const stringData = localStorage.getItem('layout');
    if (stringData) {
      const storedData = JSON.parse(stringData);
      if (storedData) {
        const { expandLevel, displayId, editorAreaW, editorAndSetAreaW, customExpandLevel } = storedData;
        setExpandLevel(expandLevel);
        setDisplayId(displayId);
        setEditorAreaW(editorAreaW);
        setEditorAndSetAreaW(editorAndSetAreaW);
        setCustomExpandLevel(customExpandLevel);
        setIsInit(false);
        return;
      }
    }
    localStorage.setItem('layout', JSON.stringify({ expandLevel, displayId, editorAreaW, editorAndSetAreaW, customExpandLevel, isInit: true }))
  }, [])

  useEffect(() => {
    if (isInit) {
      return
    }

    localStorage.setItem('layout', JSON.stringify({ expandLevel, displayId, editorAreaW, editorAndSetAreaW, customExpandLevel }))

  }, [expandLevel, displayId, editorAreaW, editorAndSetAreaW, customExpandLevel])


  // Resize 處理
  useEffect(() => {
    const handleResize = (): void => {
      const newW = document.documentElement.clientWidth
      if (newW < 640) {
        setMaxExpandLevel(0)
        setEditorAndSetAreaW(newW)
        setEditorAreaW(newW)
        setMaxW(newW)
        return
      } else if (newW < 1024) {
        setMaxExpandLevel(1)
      } else {
        setMaxExpandLevel(2)
      }
      setMaxW(newW)
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // ExpandLevel 處理
  useEffect(() => {
    if (editorAndSetAreaW == 0) {
      setEditorAndSetAreaW(editorAreaW)
      setEditorAreaW(editorAreaW - minW)
    }
    if (customExpandLevel > -1) {
      const newExpandLevel = Math.min(maxExpandLevel, customExpandLevel)
      setExpandLevel(newExpandLevel)
    }
  }, [customExpandLevel, maxExpandLevel])

  // Width 調整處理
  useEffect(() => {
    if (maxW < minW + editorAndSetAreaW) {
      setEditorAndSetAreaW(maxW - (1.3 * minW))
    }
    if (maxW < expandLevel * minW + editorAreaW) {
      setEditorAreaW(maxW - (expandLevel > 2 ? 1.3 * minW : 0) - (expandLevel > 1 ? minW : 0))
    }
  }, [maxW, editorAndSetAreaW, editorAreaW, expandLevel, minW])

  // 移動處理函數
  const handleMove = (clientX: number): void => {
    const XOffset = clientX - startXRef.current;
    if (isResizing) {
      if (movingRef.current === 0) {
        if (editorAndSetAreaW - (startEWRef.current + (XOffset)) < minW && expandLevel > 1) {
          setEditorAndSetAreaW(Math.min(maxW - (1.3 * minW), Math.max(minW, startEWRef.current + (XOffset) + minW)))
        }

        setEditorAreaW(Math.min(maxW - (expandLevel > 1 ? 1 * minW : 0) - (expandLevel > 0 ? 1.3 * minW : 0), Math.max(minW, startEWRef.current + (XOffset))))

        if (maxW - (expandLevel > 1 ? 1 * minW : 0) - (expandLevel > 0 ? 1.3 * minW : 0) < Math.max(minW, startEWRef.current + (XOffset)) && expandLevel === 1) {
          setEditorAndSetAreaW(0)
        }
      } else if (movingRef.current === 1) {
        if (startESWRef.current + (XOffset) < (2 * minW)) {
          return
        }
        if (startESWRef.current + (XOffset) - editorAreaW < minW) {
          setEditorAreaW(startESWRef.current + (XOffset) - minW)
        }
        setEditorAndSetAreaW(Math.min((maxW - 1.3 * minW), Math.max(386, startESWRef.current + (XOffset))))
      }
    }
  }

  // 滑鼠事件處理
  useEffect(() => {
    const onMouseMove = (e: MouseEvent): void => {
      if (isResizing) {
        handleMove(e.clientX)
      }
    }

    const onMouseUp = (): void => {
      setIsResizing(false)
      startEWRef.current = editorAreaW
      startESWRef.current = editorAndSetAreaW
      movingRef.current = -1
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    if (isResizing) {
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [isResizing, editorAreaW, editorAndSetAreaW])

  // 觸控事件處理
  useEffect(() => {
    const onTouchMove = (e: TouchEvent): void => {
      if (isResizing) {
        const moveTouch = e.changedTouches[0]
        handleMove(moveTouch.clientX)
      }
    }

    const onTouchEnd = (): void => {
      setIsResizing(false)
      startEWRef.current = editorAreaW
      startESWRef.current = editorAndSetAreaW
      movingRef.current = -1
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }

    if (isResizing) {
      document.addEventListener('touchmove', onTouchMove)
      document.addEventListener('touchend', onTouchEnd)
    }

    return () => {
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
    }
  }, [isResizing, editorAreaW, editorAndSetAreaW])


  // 開始移動處理
  const handleMoveStart = (clientX: number): void => {
    setIsResizing(true)
    startXRef.current = clientX
    startEWRef.current = editorAreaW
    startESWRef.current = editorAndSetAreaW
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>, target: number): void => {
    movingRef.current = target
    handleMoveStart(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, target: number): void => {
    movingRef.current = target
    const touch = e.changedTouches[0]
    handleMoveStart(touch.clientX)
  }

  return (
    <Router>
      <div className='app h-[100dvh] overflow-y-hidden flex flex-col overflow-x-hidden'>
        {shouldShowHeader && (
          <header className='header sticky h-10 bg-blue-300 rounded-b-md -mb-1 z-10 text-l flex justify-between'>
            <Link to="/">
              <div
                className='w-28 h-[70px] bg-transparent -mt-[15px] ml-2 pointer-events-none'
                style={{
                  backgroundImage: "url(md2pdf_n_sm.png)",
                  backgroundPosition: "center",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </Link>
            <div className=' mr-12 text-xl pt-[1px] space-x-4 text-blue-300'>
              <a target="_blank" href='https://github.com/jx06T/md2pdf-HighlyCustomizable' className=' bg-blue-500 px-2 py-1 rounded-b-md underline decoration-blue-300 underline-offset-1 cursor-pointer'> <TdesignLogoGithubFilled className=' inline-block mb-1 sm:mr-1 text-blue-300' /><span className=' hidden sm:inline'>Github</span></a>
              <Link to="/docs" className='bg-blue-500 px-2 py-1 rounded-b-md underline decoration-blue-300 underline-offset-1 cursor-pointer'><MaterialSymbolsDocsOutlineRounded className=' inline-block mb-1 sm:mr-1' /><span className=' hidden sm:inline'>Docs</span></Link>
            </div>
          </header>
        )}

        <button
          onClick={() => setShouldShowHeader(!shouldShowHeader)}
          className='show-botton fixed right-2 top-2 z-30'
        >
          {shouldShowHeader ? (
            <JamChevronCircleUp className='text-2xl' />
          ) : (
            <JamChevronCircleDown className='text-2xl' />
          )}
        </button>

        <MdProvider>
          <Routes>
            <Route path="/" element={
              <>
                <noscript>
                  <div>請啟用 JavaScript 來獲得最佳體驗</div>
                </noscript>
                <div
                  style={{
                    scale: (expandLevel > 1 ? maxW - editorAndSetAreaW : (expandLevel > 0 ? maxW - editorAreaW : maxW)) / 850,
                    left: expandLevel > 1 ? editorAndSetAreaW : (expandLevel > 0 ? editorAreaW : 0),
                    marginLeft: expandLevel > 1 ? 24 : (expandLevel > 0 ? 16 : 8),
                    display: expandLevel > 0 ? "block" : (displayId === 2 ? "block" : "none")
                  }}
                  className="cover"
                />
                <UpperToolbar
                  setCustomExpandLevel={setCustomExpandLevel}
                  editorAndSetWidth={editorAndSetAreaW}
                  editorWidth={editorAreaW}
                  maxExpandLevel={maxExpandLevel}
                  expandLevel={expandLevel}
                  displayId={displayId}
                  setDisplayId={setDisplayId}
                />
                <main className={`main flex h-full flex-grow relative ${isResizing ? "pointer-events-none-j" : ""} overflow-y-hidden overflow-x-hidden`}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditorArea
                      expandLevel={expandLevel}
                      width={expandLevel === 0 ? maxW : editorAreaW}
                    />
                  </Suspense>

                  {expandLevel > 0 && (
                    <div
                      onTouchStart={(e) => handleTouchStart(e, 0)}
                      onMouseDown={(e) => onMouseDown(e, 0)}
                      className='print-hide cursor-col-resize w-2 bg-stone-300 hover:bg-slate-50 resize-col flex-grow-0 flex-shrink-0'
                    />
                  )}

                  <Suspense fallback={<LoadingSpinner />}>
                    <SetArea
                      displayId={displayId}
                      expandLevel={expandLevel}
                      width={expandLevel > 1 ? editorAndSetAreaW - editorAreaW : (expandLevel > 0 ? editorAreaW : maxW)}
                    />
                  </Suspense>

                  {expandLevel > 1 && (
                    <div
                      onTouchStart={(e) => handleTouchStart(e, 1)}
                      onMouseDown={(e) => onMouseDown(e, 1)}
                      className='print-hide cursor-col-resize w-2 bg-stone-300 hover:bg-slate-50 resize-col flex-grow-0 flex-shrink-0'
                    />
                  )}

                  <Suspense fallback={<LoadingSpinner />}>
                    <PreviewArea
                      width={expandLevel > 1 ? maxW - editorAndSetAreaW : (expandLevel > 0 ? maxW - editorAreaW : maxW)}
                      expandLevel={expandLevel}
                      displayId={displayId}
                    />
                  </Suspense>
                </main>
              </>
            } />

            <Route path="/docs" element={<DocsPage maxW={maxW} />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MdProvider>
      </div>
    </Router >
  )
}

export default App