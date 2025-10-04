<template>
  <div class="cyberpunk-bg" :style="{ background: 'var(--color-bg-base)' }">
    <!-- Animated Grid -->
    <div class="grid-container">
      <div class="grid-lines horizontal"></div>
      <div class="grid-lines vertical"></div>
    </div>

    <!-- Particles (减少数量，从50减到20) -->
    <div class="particles">
      <div
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <!-- Glowing Orbs (降低亮度和数量) -->
    <div class="orbs">
      <div class="orb orb-cyan"></div>
      <div class="orb orb-magenta"></div>
    </div>

    <!-- Scanlines -->
    <div class="scanlines"></div>

    <!-- Noise Overlay (降低不透明度) -->
    <div class="noise"></div>
  </div>
</template>

<script setup lang="ts">
const getParticleStyle = (index: number) => {
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  const randomDuration = 4 + Math.random() * 5; // 稍微慢一点
  const randomSize = 1.5 + Math.random() * 2; // 稍微小一点

  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
    width: `${randomSize}px`,
    height: `${randomSize}px`,
  };
};
</script>

<style scoped>
.cyberpunk-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

/* Animated Grid - 降低透明度 */
.grid-container {
  position: absolute;
  inset: 0;
  opacity: 0.08; /* 从 0.15 降低到 0.08 */
}

.grid-lines {
  position: absolute;
  background-size: 60px 60px;
  animation: gridMove 20s linear infinite;
}

.grid-lines.horizontal {
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 59px,
    var(--color-primary) 59px,
    var(--color-primary) 60px
  );
}

.grid-lines.vertical {
  inset: 0;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 59px,
    var(--color-primary) 59px,
    var(--color-primary) 60px
  );
}

@keyframes gridMove {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(60px);
  }
}

/* Particles - 降低亮度 */
.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--color-primary);
  animation: particleFloat linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.6; /* 从 1 降低到 0.6 */
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* Glowing Orbs - 大幅降低亮度和尺寸 */
.orbs {
  position: absolute;
  inset: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px); /* 增加模糊，从 60px 到 80px */
  opacity: 0.15; /* 从 0.3 降低到 0.15 */
  animation: orbFloat 20s ease-in-out infinite; /* 慢一点，从 15s 到 20s */
}

.orb-cyan {
  width: 350px;
  height: 350px;
  background: var(--color-primary);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-magenta {
  width: 300px;
  height: 300px;
  background: var(--color-secondary);
  bottom: 20%;
  right: 15%;
  animation-delay: -7s;
}

/* 移除黄色球体 */

@keyframes orbFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40px, -40px) scale(1.05); /* 减小移动幅度 */
  }
  66% {
    transform: translate(-25px, 25px) scale(0.95);
  }
}

/* Scanlines - 降低可见度 */
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.05) 0px,
    /* 从 0.1 降低到 0.05 */ rgba(0, 0, 0, 0.05) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  animation: scanlineMove 10s linear infinite; /* 慢一点，从 8s 到 10s */
}

@keyframes scanlineMove {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

/* Noise Overlay - 大幅降低不透明度 */
.noise {
  position: absolute;
  inset: 0;
  opacity: 0.015; /* 从 0.03 降低到 0.015 */
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  animation: noiseMove 0.8s steps(2) infinite; /* 稍微慢一点 */
}

@keyframes noiseMove {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(3px, 3px); /* 减小移动幅度 */
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
