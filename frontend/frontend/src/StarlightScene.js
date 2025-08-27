// src/StarlightScene.js
import * as THREE from 'three'

export function initStarlightScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a2a)

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  )
  camera.position.set(0, 0, 5)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,              // 🔴 투명 비활성화
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setClearColor(0x0a0a2a, 1)  // 🔴 불투명 배경
  container.appendChild(renderer.domElement)

  // 별 파티클
  const geometry = new THREE.BufferGeometry()
  const vertices = []
  for (let i = 0; i < 2000; i++) {
    vertices.push((Math.random() - 0.5) * 100)
    vertices.push((Math.random() - 0.5) * 100)
    vertices.push((Math.random() - 0.5) * 100)
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 })
  const stars = new THREE.Points(geometry, material)
  scene.add(stars)

  let req
  function animate(t) {
    camera.position.x = Math.sin(t * 0.0001) * 2
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
    req = requestAnimationFrame(animate)
  }
  req = requestAnimationFrame(animate)

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  window.addEventListener('resize', onResize)

  // App이 씬 바꿀 때 깔끔 종료
  return () => {
    cancelAnimationFrame(req)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    container.removeChild(renderer.domElement)
    scene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose?.()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.())
        else obj.material.dispose?.()
      }
    })
  }
}
