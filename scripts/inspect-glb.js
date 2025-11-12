import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import fs from 'fs';
import path from 'path';

const modelPath = process.argv[2] || './public/packaging/compressed_Handlebar-b.glb';

console.log('🔍 Inspecting GLB Model:', modelPath);
console.log('='.repeat(80));

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

// Load the model
const buffer = fs.readFileSync(modelPath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

loader.parse(arrayBuffer, '', (gltf) => {
  console.log('\n📦 GLTF Structure:');
  console.log('  - Scenes:', gltf.scenes.length);
  console.log('  - Animations:', gltf.animations.length);
  console.log('  - Cameras:', gltf.cameras?.length || 0);

  console.log('\n🌳 Scene Graph:');
  let meshCount = 0;
  let materialCount = 0;
  const materials = new Map();

  function traverseNode(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const type = node.type || 'Object3D';
    const name = node.name || '(unnamed)';

    console.log(`${indent}├─ [${type}] ${name}`);

    if (node.isMesh) {
      meshCount++;
      console.log(`${indent}│  └─ Geometry:`);

      if (node.geometry) {
        const geo = node.geometry;
        console.log(`${indent}│     ├─ Vertices: ${geo.attributes.position?.count || 0}`);
        console.log(`${indent}│     ├─ Faces: ${geo.index ? geo.index.count / 3 : 'N/A'}`);
        console.log(`${indent}│     ├─ Has UV: ${!!geo.attributes.uv}`);
        console.log(`${indent}│     ├─ Has UV2: ${!!geo.attributes.uv2}`);
        console.log(`${indent}│     ├─ Has Normals: ${!!geo.attributes.normal}`);
        console.log(`${indent}│     ├─ Has Tangents: ${!!geo.attributes.tangent}`);
        console.log(`${indent}│     └─ Has Colors: ${!!geo.attributes.color}`);

        // UV mapping details
        if (geo.attributes.uv) {
          const uvArray = geo.attributes.uv.array;
          const uvMin = { u: Infinity, v: Infinity };
          const uvMax = { u: -Infinity, v: -Infinity };

          for (let i = 0; i < uvArray.length; i += 2) {
            uvMin.u = Math.min(uvMin.u, uvArray[i]);
            uvMax.u = Math.max(uvMax.u, uvArray[i]);
            uvMin.v = Math.min(uvMin.v, uvArray[i + 1]);
            uvMax.v = Math.max(uvMax.v, uvArray[i + 1]);
          }

          console.log(`${indent}│        UV Range: U[${uvMin.u.toFixed(3)}, ${uvMax.u.toFixed(3)}] V[${uvMin.v.toFixed(3)}, ${uvMax.v.toFixed(3)}]`);
        }
      }

      if (node.material) {
        const mat = Array.isArray(node.material) ? node.material[0] : node.material;
        const matName = mat.name || '(unnamed material)';

        if (!materials.has(matName)) {
          materials.set(matName, mat);
          materialCount++;
        }

        console.log(`${indent}│  └─ Material: "${matName}"`);
        console.log(`${indent}│     ├─ Type: ${mat.type}`);
        console.log(`${indent}│     ├─ Has map: ${!!mat.map}`);
        console.log(`${indent}│     ├─ Has normalMap: ${!!mat.normalMap}`);
        console.log(`${indent}│     ├─ Has roughnessMap: ${!!mat.roughnessMap}`);
        console.log(`${indent}│     ├─ Has metalnessMap: ${!!mat.metalnessMap}`);
        console.log(`${indent}│     ├─ Has aoMap: ${!!mat.aoMap}`);
        console.log(`${indent}│     ├─ Color: ${mat.color ? `rgb(${Math.round(mat.color.r*255)}, ${Math.round(mat.color.g*255)}, ${Math.round(mat.color.b*255)})` : 'N/A'}`);
        console.log(`${indent}│     ├─ Metalness: ${mat.metalness ?? 'N/A'}`);
        console.log(`${indent}│     ├─ Roughness: ${mat.roughness ?? 'N/A'}`);
        console.log(`${indent}│     ├─ Side: ${mat.side === THREE.FrontSide ? 'FrontSide' : mat.side === THREE.BackSide ? 'BackSide' : 'DoubleSide'}`);
        console.log(`${indent}│     └─ Transparent: ${!!mat.transparent}`);

        if (mat.map) {
          console.log(`${indent}│        Map Details:`);
          console.log(`${indent}│        ├─ Size: ${mat.map.image?.width || 'N/A'} x ${mat.map.image?.height || 'N/A'}`);
          console.log(`${indent}│        ├─ FlipY: ${mat.map.flipY}`);
          console.log(`${indent}│        ├─ WrapS: ${mat.map.wrapS === THREE.RepeatWrapping ? 'RepeatWrapping' : mat.map.wrapS === THREE.ClampToEdgeWrapping ? 'ClampToEdgeWrapping' : 'MirroredRepeatWrapping'}`);
          console.log(`${indent}│        └─ WrapT: ${mat.map.wrapT === THREE.RepeatWrapping ? 'RepeatWrapping' : mat.map.wrapT === THREE.ClampToEdgeWrapping ? 'ClampToEdgeWrapping' : 'MirroredRepeatWrapping'}`);
        }
      }
    }

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverseNode(child, depth + 1));
    }
  }

  gltf.scene.traverse((node) => {
    if (!node.parent || node.parent === gltf.scene) {
      traverseNode(node);
    }
  });

  console.log('\n📊 Summary:');
  console.log(`  - Total Meshes: ${meshCount}`);
  console.log(`  - Total Materials: ${materialCount}`);
  console.log(`  - Material Names: ${Array.from(materials.keys()).join(', ')}`);

  console.log('\n💡 Recommendations for Texture Application:');
  console.log('  1. Identify which mesh(es) need the canvas texture');
  console.log('  2. Check UV mapping range - should be [0,1] for proper wrapping');
  console.log('  3. Set texture.flipY based on UV orientation');
  console.log('  4. Apply to material.map property');
  console.log('  5. Set material.needsUpdate = true');

  console.log('\n✅ Inspection Complete!');
  console.log('='.repeat(80));
}, (error) => {
  console.error('❌ Error loading model:', error);
});
