"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function MagicalBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create Particles (Gold Dust)
    const particleCount = 2500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color("#d8a15b"); // Gold
    const color2 = new THREE.Color("#932230"); // Bordeaux
    const color3 = new THREE.Color("#ffffff"); // White/Sparkle

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3000;

      const mixedColor = color1.clone();
      const rand = Math.random();
      if (rand > 0.6) {
        mixedColor.lerp(color2, Math.random());
      } else if (rand < 0.1) {
        mixedColor.lerp(color3, Math.random());
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      sizes[i] = Math.random() * 2;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for soft glowing particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Gentle pulsing based on position and time
          float pulse = sin(time * 0.001 + position.x * 0.05) * 0.5 + 0.5;
          gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + pulse);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Circular particle with soft edge
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          // Soft glow
          float alpha = 1.0 - (dist * 2.0);
          alpha = pow(alpha, 1.5);
          
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Mouse Interaction (Parallax)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onPointerMove = (event: PointerEvent) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };
    document.addEventListener("pointermove", onPointerMove);

    // 4. Resize Handler
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize);

    // 5. Animation Loop
    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 1;
      material.uniforms.time.value = time;

      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;

      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      // Slowly rotate the entire particle system
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 6. Cleanup
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onWindowResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 h-full w-full bg-[#110406] mix-blend-screen"
      style={{
        background: "radial-gradient(circle at center, #350811 0%, #110406 100%)",
      }}
      aria-hidden="true"
    />
  );
}
