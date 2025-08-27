// src/App.jsx
import { useEffect, useRef, useState } from 'react'
import { initStarlightScene } from './StarlightScene'
import { initForestScene } from './ForestScene'
import { initOceanScene } from './OceanScene'

export default function App() {
  const containerRef = useRef(null)
  const cleanupRef = useRef(null)
  const [sceneType, setSceneType] = useState('starlight') // 'forest' | 'ocean'

  useEffect(() => {
    if (!containerRef.current) return

    // 기존 씬 정리
    if (cleanupRef.current) cleanupRef.current()

    // 새로운 씬 초기화
    if (sceneType === 'starlight') {
      cleanupRef.current = initStarlightScene(containerRef.current)
    } else if (sceneType === 'forest') {
      cleanupRef.current = initForestScene(containerRef.current)
    } else if (sceneType === 'ocean') {
      cleanupRef.current = initOceanScene(containerRef.current)
    }

    return () => {
      if (cleanupRef.current) cleanupRef.current()
      cleanupRef.current = null
    }
  }, [sceneType])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', overflow: 'hidden' }}
      />
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          display: 'flex',
          gap: 8,
          background: 'rgba(0,0,0,0.35)',
          padding: '8px 10px',
          borderRadius: 12,
          backdropFilter: 'blur(6px)',
        }}
      >
        <button
          onClick={() => setSceneType('starlight')}
          style={btnStyle(sceneType === 'starlight')}
        >
          ✨ Starlight
        </button>
        <button
          onClick={() => setSceneType('forest')}
          style={btnStyle(sceneType === 'forest')}
        >
          🌲 Forest
        </button>
        <button
          onClick={() => setSceneType('ocean')}
          style={btnStyle(sceneType === 'ocean')}
        >
          🌊 Ocean
        </button>
      </div>
    </div>
  )
}

function btnStyle(active) {
  return {
    border: 'none',
    color: active ? '#0b1d16' : '#e9f1ff',
    background: active ? '#e9f1ff' : 'transparent',
    padding: '8px 10px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
  }
}
