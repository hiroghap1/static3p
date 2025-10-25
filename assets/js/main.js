import * as THREE from 'three';

// シーン、カメラ、レンダラーのセットアップ
const canvas = document.getElementById('ikura-canvas');
const scene = new THREE.Scene();
// FOVを50度に下げて歪みを軽減（望遠レンズ的な見え方）
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true, // 背景を透明に
    antialias: true 
});

// canvasのサイズを正確に設定
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
// FOVを下げた分、カメラを遠ざける
camera.position.z = 40;

// 環境マップを作成（反射用）
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
envScene.background = new THREE.Color(0xffffff);
const envTexture = pmremGenerator.fromScene(envScene).texture;

// ライティング設定（イクラの色とツヤを引き出す）
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight1.position.set(5, 10, 5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffe5cc, 0.5);
directionalLight2.position.set(-5, 5, 5);
scene.add(directionalLight2);

const pointLight = new THREE.PointLight(0xffffff, 0.7);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);

// イクラのクラス
class Ikura {
    constructor() {
        // 真円で、サイズの差をほとんどなくす
        const size = 0.38 + Math.random() * 0.08; // 0.38～0.46の範囲
        
        // 完全な真円（セグメント数を増やしてより滑らか）
        const geometry = new THREE.SphereGeometry(size, 64, 64);
        
        // イクラらしい鮮やかな色合い
        const hue = 0.028 + Math.random() * 0.012; // オレンジ～赤系
        const saturation = 0.95 + Math.random() * 0.05; // 高い彩度
        const lightness = 0.55 + Math.random() * 0.06; // 明るめの色
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        
        // イクラらしいツヤツヤの質感
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: 0.0, // 金属感なし（イクラは有機物）
            roughness: 0.12, // 適度な滑らかさでツヤツヤに
            transmission: 0.6, // 透明感を強めに
            thickness: 0.8,
            transparent: true,
            opacity: 0.95,
            clearcoat: 1.0, // 表面のツヤ
            clearcoatRoughness: 0.15, // 適度な光沢
            ior: 1.42, // イクラの屈折率
            reflectivity: 0.5, // 適度な反射
            envMap: envTexture, // 環境マップを適用
            envMapIntensity: 0.6, // 環境反射は控えめに
            sheen: 0.6, // 適度な光沢
            sheenRoughness: 0.25,
            sheenColor: new THREE.Color(0xffbb88), // 暖かい光沢
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        
        // 完全な真円を保証（スケールを均等に）
        this.mesh.scale.set(1, 1, 1);
        
        // 初期位置をランダムに設定
        this.reset();
        
        // 落下速度をランダムに
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05, // わずかな横揺れ
            -(0.1 + Math.random() * 0.15), // 下方向への速度
            (Math.random() - 0.5) * 0.05
        );
        
        // 回転速度をランダムに
        this.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );
        
        scene.add(this.mesh);
    }
    
    reset() {
        // 画面上部のランダムな位置に配置
        this.mesh.position.set(
            (Math.random() - 0.5) * 60,
            30 + Math.random() * 10,
            (Math.random() - 0.5) * 20
        );
    }
    
    update() {
        // 位置を更新
        this.mesh.position.add(this.velocity);
        
        // 回転を更新
        this.mesh.rotation.x += this.rotationSpeed.x;
        this.mesh.rotation.y += this.rotationSpeed.y;
        this.mesh.rotation.z += this.rotationSpeed.z;
        
        // 画面下に落ちたらリセット
        if (this.mesh.position.y < -30) {
            this.reset();
        }
    }
}

// イクラの配列
const ikuras = [];
const ikuraCount = 100; // イクラの数

// 大量のイクラを生成
for (let i = 0; i < ikuraCount; i++) {
    // 時間差で出現させるため、初期位置を調整
    const ikura = new Ikura();
    ikura.mesh.position.y -= Math.random() * 60; // 初期位置を分散
    ikuras.push(ikura);
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    
    // すべてのイクラを更新
    ikuras.forEach(ikura => ikura.update());
    
    // カメラをわずかに揺らす（より動的な効果）
    camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    
    renderer.render(scene, camera);
}

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// アニメーション開始
animate();
