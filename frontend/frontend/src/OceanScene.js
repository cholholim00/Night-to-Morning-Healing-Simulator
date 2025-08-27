// src/ForestScene.js
import * as THREE from 'three'

export function initForestScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b1d16) // 짙은 녹색 밤하늘
  scene.fog = new THREE.Fog(0x0b1d16, 10, 80)

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    200
  )
  camera.position.set(0, 4, 10)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  // 조명
  const hemi = new THREE.HemisphereLight(0xbcd9c4, 0x0b1d16, 0.6)
  scene.add(hemi)

  const dir = new THREE.DirectionalLight(0xdde8d5, 0.8)
  dir.position.set(-8, 12, -6)
  dir.castShadow = true
  dir.shadow.mapSize.set(1024, 1024)
  scene.add(dir)

  // 부드러운 언덕 지형 (사인 기반)
  const size = 120
  const segments = 200
  const geo = new THREE.PlaneGeometry(size, size, segments, segments)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const h =
      Math.sin(x * 0.15) * 0.6 +
      Math.sin(y * 0.1 + x * 0.05) * 0.4 +
      Math.cos((x + y) * 0.08) * 0.3
    pos.setZ(i, h)
  }
  geo.computeVertexNormals()

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2c5f2d,
    roughness: 0.95,
    metalness: 0.0,
  })
  const ground = new THREE.Mesh(geo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 나무(원통 + 콘) 다수 배치
  const treeGroup = new THREE.Group()
  scene.add(treeGroup)

  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 0.9 })
  const leafGeo = new THREE.ConeGeometry(0.8, 1.6, 12)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.8 })

  function heightAt(x, y) {
    return (
      Math.sin(x * 0.15) * 0.6 +
      Math.sin(y * 0.1 + x * 0.05) * 0.4 +
      Math.cos((x + y) * 0.08) * 0.3
    )
  }

  const rng = () => (Math.random() - 0.5) * 1.0
  for (let i = 0; i < 120; i++) {
    const x = (Math.random() - 0.5) * 70
    const z = (Math.random() - 0.5) * 70
    const y = heightAt(x, z)

    // 그라운드에 너무 가까운 카메라 전방은 비워두면 더 자연스러움
    if (Math.hypot(x, z) < 4) continue

    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.castShadow = true
    trunk.position.set(x + rng(), y + 0.6, z + rng())

    const leaf = new THREE.Mesh(leafGeo, leafMat)
    leaf.castShadow = true
    leaf.position.set(0, 1.4, 0)

    const tree = new THREE.Group()
    tree.add(trunk)
    tree.add(leaf)

    // 나무별로 약간의 스케일 변주
    const s = 0.8 + Math.random() * 0.8
    tree.scale.setScalar(s)

    tree.userData.windOffset = Math.random() * Math.PI * 2
    tree.position.set(x, y, z)
    treeGroup.add(tree)
  }

  // 은은한 입자(숲 속 먼지)
  const dustGeo = new THREE.BufferGeometry()
  const dustCount = 800
  const dustPos = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 60
    dustPos[i * 3 + 1] = Math.random() * 6 + 1
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 60
  }
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3))
  const dustMat = new THREE.PointsMaterial({ color: 0xdfeee3, size: 0.05, transparent: true, opacity: 0.6 })
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)

  // 카메라 천천히 드리프트
  let t0 = performance.now()
  function animate(t) {
    const dt = (t - t0) * 0.001
    t0 = t

    // 바람에 나무 잔잔히 흔들림
    treeGroup.children.forEach((tree) => {
      const o = tree.userData.windOffset || 0
      const sway = Math.sin(performance.now() * 0.0015 + o) * 0.06
      tree.rotation.z = sway
    })

    camera.position.x = Math.sin(performance.now() * 0.00025) * 2
    camera.lookAt(0, 1.5, 0)

    renderer.render(scene, camera)
    req = requestAnimationFrame(animate)
  }

  let req = requestAnimationFrame(animate)

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  window.addEventListener('resize', onResize)

  return () => {
    cancelAnimationFrame(req)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    container.removeChild(renderer.domElement)
    scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose?.()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.())
        else obj.material.dispose?.()
      }
    })
  }
}
