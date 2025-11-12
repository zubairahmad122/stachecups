import fs from 'fs';

const modelPath = process.argv[2] || './public/packaging/compressed_Handlebar-b.glb';

console.log('🔍 Inspecting GLB Model:', modelPath);
console.log('='.repeat(80));

try {
  const buffer = fs.readFileSync(modelPath);

  // GLB Format:
  // Header (12 bytes): magic (4), version (4), length (4)
  // JSON Chunk: chunkLength (4), chunkType (4), JSON data
  // Binary Chunk: chunkLength (4), chunkType (4), binary data

  const magic = buffer.toString('ascii', 0, 4);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  console.log('\n📦 GLB Header:');
  console.log(`  - Magic: ${magic}`);
  console.log(`  - Version: ${version}`);
  console.log(`  - Total Length: ${length} bytes (${(length / 1024).toFixed(2)} KB)`);

  // Read JSON chunk
  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.readUInt32LE(16);
  const jsonData = buffer.toString('utf8', 20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonData);

  console.log('\n📄 GLTF JSON Structure:');
  console.log(`  - Asset version: ${gltf.asset?.version}`);
  console.log(`  - Generator: ${gltf.asset?.generator || 'N/A'}`);
  console.log(`  - Scenes: ${gltf.scenes?.length || 0}`);
  console.log(`  - Nodes: ${gltf.nodes?.length || 0}`);
  console.log(`  - Meshes: ${gltf.meshes?.length || 0}`);
  console.log(`  - Materials: ${gltf.materials?.length || 0}`);
  console.log(`  - Textures: ${gltf.textures?.length || 0}`);
  console.log(`  - Images: ${gltf.images?.length || 0}`);
  console.log(`  - Accessors: ${gltf.accessors?.length || 0}`);
  console.log(`  - BufferViews: ${gltf.bufferViews?.length || 0}`);

  // Analyze scene structure
  console.log('\n🌳 Scene Structure:');
  if (gltf.scenes && gltf.scenes.length > 0) {
    gltf.scenes.forEach((scene, i) => {
      console.log(`  Scene ${i}: "${scene.name || '(unnamed)'}"`);
      if (scene.nodes) {
        scene.nodes.forEach(nodeIdx => {
          printNode(gltf, nodeIdx, 2);
        });
      }
    });
  }

  // Analyze meshes
  console.log('\n🎨 Meshes:');
  if (gltf.meshes) {
    gltf.meshes.forEach((mesh, i) => {
      console.log(`  Mesh ${i}: "${mesh.name || '(unnamed)'}"`);
      if (mesh.primitives) {
        mesh.primitives.forEach((prim, j) => {
          console.log(`    Primitive ${j}:`);
          console.log(`      - Material: ${prim.material ?? 'N/A'}`);
          console.log(`      - Mode: ${getPrimitiveMode(prim.mode)}`);
          console.log(`      - Attributes:`);

          for (const [attr, accessorIdx] of Object.entries(prim.attributes)) {
            const accessor = gltf.accessors[accessorIdx];
            console.log(`        - ${attr}: ${accessor.type} x ${accessor.count} (${accessor.componentType})`);

            // Check UV bounds
            if (attr === 'TEXCOORD_0' && accessor.min && accessor.max) {
              console.log(`          UV Range: [${accessor.min[0].toFixed(3)}, ${accessor.min[1].toFixed(3)}] to [${accessor.max[0].toFixed(3)}, ${accessor.max[1].toFixed(3)}]`);
            }
          }

          if (prim.indices !== undefined) {
            const accessor = gltf.accessors[prim.indices];
            console.log(`      - Indices: ${accessor.count} (${Math.floor(accessor.count / 3)} triangles)`);
          }
        });
      }
    });
  }

  // Analyze materials
  console.log('\n🎨 Materials:');
  if (gltf.materials) {
    gltf.materials.forEach((mat, i) => {
      console.log(`  Material ${i}: "${mat.name || '(unnamed)'}"`);
      console.log(`    - Alpha Mode: ${mat.alphaMode || 'OPAQUE'}`);
      console.log(`    - Double Sided: ${mat.doubleSided || false}`);

      if (mat.pbrMetallicRoughness) {
        const pbr = mat.pbrMetallicRoughness;
        console.log(`    - PBR Metallic Roughness:`);
        if (pbr.baseColorFactor) {
          console.log(`      - Base Color: rgba(${pbr.baseColorFactor.map(v => (v * 255).toFixed(0)).join(', ')})`);
        }
        if (pbr.baseColorTexture) {
          console.log(`      - Base Color Texture: texture ${pbr.baseColorTexture.texCoord || 0} -> ${pbr.baseColorTexture.index}`);
        }
        console.log(`      - Metallic Factor: ${pbr.metallicFactor ?? 1.0}`);
        console.log(`      - Roughness Factor: ${pbr.roughnessFactor ?? 1.0}`);
        if (pbr.metallicRoughnessTexture) {
          console.log(`      - Metallic/Roughness Texture: ${pbr.metallicRoughnessTexture.index}`);
        }
      }

      if (mat.normalTexture) {
        console.log(`    - Normal Texture: ${mat.normalTexture.index}`);
      }
      if (mat.occlusionTexture) {
        console.log(`    - Occlusion Texture: ${mat.occlusionTexture.index}`);
      }
      if (mat.emissiveTexture) {
        console.log(`    - Emissive Texture: ${mat.emissiveTexture.index}`);
      }
    });
  }

  // Analyze textures
  console.log('\n🖼️  Textures:');
  if (gltf.textures) {
    gltf.textures.forEach((tex, i) => {
      console.log(`  Texture ${i}:`);
      console.log(`    - Source Image: ${tex.source ?? 'N/A'}`);
      console.log(`    - Sampler: ${tex.sampler ?? 'N/A'}`);
    });
  }

  // Analyze images
  console.log('\n🖼️  Images:');
  if (gltf.images) {
    gltf.images.forEach((img, i) => {
      console.log(`  Image ${i}: "${img.name || '(unnamed)'}"`);
      console.log(`    - MIME Type: ${img.mimeType || 'N/A'}`);
      console.log(`    - BufferView: ${img.bufferView ?? 'N/A'}`);
      if (img.uri) {
        console.log(`    - URI: ${img.uri}`);
      }
    });
  }

  console.log('\n💡 Key Findings for Texture Application:');
  console.log('  ✓ This model has:');
  console.log(`    - ${gltf.meshes?.length || 0} mesh(es)`);
  console.log(`    - ${gltf.materials?.length || 0} material(s)`);

  // Check if materials have baseColorTexture
  const materialsWithTexture = gltf.materials?.filter(m => m.pbrMetallicRoughness?.baseColorTexture) || [];
  console.log(`    - ${materialsWithTexture.length} material(s) with baseColorTexture`);

  console.log('\n📋 To Apply Canvas Texture:');
  console.log('  1. Traverse the loaded GLTF scene');
  console.log('  2. Find mesh(es) with the material you want to replace');
  console.log('  3. Create a THREE.CanvasTexture from your canvas element');
  console.log('  4. Set material.map = canvasTexture');
  console.log('  5. Configure texture wrapping and flipY as needed');
  console.log('  6. Set material.needsUpdate = true');

  console.log('\n✅ Inspection Complete!');
  console.log('='.repeat(80));

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

function printNode(gltf, nodeIdx, indent = 0) {
  const node = gltf.nodes[nodeIdx];
  if (!node) return;

  const spaces = ' '.repeat(indent);
  console.log(`${spaces}├─ Node ${nodeIdx}: "${node.name || '(unnamed)'}"`);

  if (node.mesh !== undefined) {
    const mesh = gltf.meshes[node.mesh];
    console.log(`${spaces}│  └─ Mesh: "${mesh.name || '(unnamed)'}"`);
  }

  if (node.children) {
    node.children.forEach(childIdx => {
      printNode(gltf, childIdx, indent + 2);
    });
  }
}

function getPrimitiveMode(mode) {
  const modes = ['POINTS', 'LINES', 'LINE_LOOP', 'LINE_STRIP', 'TRIANGLES', 'TRIANGLE_STRIP', 'TRIANGLE_FAN'];
  return modes[mode ?? 4] || 'TRIANGLES';
}
