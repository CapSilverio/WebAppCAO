import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Configuração Básica ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Câmera mais próxima

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#particles-canvas'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Função para criar textura circular
function createCircleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    context.fillStyle = '#FFFFFF';
    context.fill();
    return new THREE.CanvasTexture(canvas);
}
const circleTexture = createCircleTexture();

// --- Sistema de Partículas Simples ---
const particleCount = 15000; // Número de partículas
const positions = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

const particleVolume = 10; // Tamanho do volume onde as partículas são geradas

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Posição aleatória dentro de um cubo
    positions[i3] = (Math.random() - 0.5) * particleVolume;
    positions[i3 + 1] = (Math.random() - 0.5) * particleVolume;
    positions[i3 + 2] = (Math.random() - 0.5) * particleVolume;

    // Cor (branco ou azul claro)
    const color = new THREE.Color(Math.random() > 0.5 ? '#FFFFFF' : '#ADD8E6');
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
}
originalPositions.set(positions);

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.08, // Tamanho das partículas
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    map: circleTexture,
    alphaTest: 0.5
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// --- Interação e Animação ---
const mouse = new THREE.Vector2();
const mouse3D = new THREE.Vector3(); // Posição 3D do mouse

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Pós-processamento (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.5; // Intensidade do brilho
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    // Atualiza a posição 3D do mouse
    mouse3D.x = mouse.x * (particleVolume / 2);
    mouse3D.y = mouse.y * (particleVolume / 2);
    mouse3D.z = 0; // Mantém no plano central

    // Lógica de Atração
    const positions = particles.geometry.attributes.position.array;
    const attractionRadius = 2.0; // Raio de atração
    const pullStrength = 0.1; // Força de atração
    const resetThreshold = 0.1; // Limite para resetar a partícula

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        const distToMouse = particlePos.distanceTo(mouse3D);

        if (distToMouse < attractionRadius) {
            const pullFactor = (attractionRadius - distToMouse) / attractionRadius; // Mais forte perto do centro
            const pullVector = new THREE.Vector3().subVectors(mouse3D, particlePos).normalize().multiplyScalar(pullStrength * pullFactor);
            particlePos.add(pullVector);

            if (distToMouse < resetThreshold) {
                // Reseta para a posição original
                particlePos.set(originalPositions[i3], originalPositions[i3 + 1], originalPositions[i3 + 2]);
            }
        }
        positions[i3] = particlePos.x;
        positions[i3 + 1] = particlePos.y;
        positions[i3 + 2] = particlePos.z;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    composer.render();
}

animate();

// Redimensionar
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
