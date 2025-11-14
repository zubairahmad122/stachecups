const fs = require('fs');
const path = require('path');

// This script reads actual UV coordinate data from GLB binary buffers
const modelsDir = path.join(__dirname, '../public/models');

function readFloat32(buffer, offset) {
  return buffer.readFloatLE(offset);
}

async function analyzeGLBModelDetailed(filePath) {
  const fileName = path.basename(filePath, '.glb');
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Analyzing: ${fileName}`);
  console.log('='.repeat(60));

  try {
    const buffer = fs.readFileSync(filePath);

    // GLB format:
    // Header (12 bytes): magic, version, length
    // JSON chunk (8 byte header + data)
    // Binary chunk (8 byte header + data)

    const jsonLength = buffer.readUInt32LE(12);
    const jsonChunkStart = 20;
    const jsonChunk = buffer.slice(jsonChunkStart, jsonChunkStart + jsonLength);
    const gltf = JSON.parse(jsonChunk.toString('utf-8'));

    // Binary chunk starts after JSON chunk
    const binaryChunkStart = jsonChunkStart + jsonLength + 8;
    const binaryData = buffer.slice(binaryChunkStart);

    console.log(`Meshes found: ${gltf.meshes ? gltf.meshes.length : 0}`);

    // Find the main mesh (usually the first one with TEXCOORD_0)
    let mainMeshIndex = 0;
    for (let i = 0; i < gltf.meshes.length; i++) {
      const mesh = gltf.meshes[i];
      if (mesh.primitives && mesh.primitives[0].attributes.TEXCOORD_0 !== undefined) {
        mainMeshIndex = i;
        break;
      }
    }

    const mainMesh = gltf.meshes[mainMeshIndex];
    console.log(`Analyzing mesh [${mainMeshIndex}]`);

    if (!mainMesh.primitives || mainMesh.primitives.length === 0) {
      console.log('No primitives found in main mesh');
      return;
    }

    const primitive = mainMesh.primitives[0];
    const uvAccessorIndex = primitive.attributes.TEXCOORD_0;

    if (uvAccessorIndex === undefined) {
      console.log('No TEXCOORD_0 found');
      return;
    }

    const uvAccessor = gltf.accessors[uvAccessorIndex];
    const uvBufferView = gltf.bufferViews[uvAccessor.bufferView];

    console.log(`UV Coordinates: ${uvAccessor.count} vertices`);
    console.log(`Buffer view: offset=${uvBufferView.byteOffset || 0}, length=${uvBufferView.byteLength}`);

    // Read UV coordinates
    const uvOffset = (uvBufferView.byteOffset || 0) + (uvAccessor.byteOffset || 0);
    const uvCount = uvAccessor.count;

    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    // Sample first 1000 UVs for analysis (or all if less than 1000)
    const sampleSize = Math.min(uvCount, 1000);

    for (let i = 0; i < sampleSize; i++) {
      const offset = uvOffset + (i * 8); // 2 floats (u,v) = 8 bytes
      const u = readFloat32(binaryData, offset);
      const v = readFloat32(binaryData, offset + 4);

      if (u < minU) minU = u;
      if (u > maxU) maxU = u;
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }

    console.log(`\nUV Range (sampled ${sampleSize} vertices):`);
    console.log(`  U: ${minU.toFixed(4)} to ${maxU.toFixed(4)} (range: ${(maxU - minU).toFixed(4)})`);
    console.log(`  V: ${minV.toFixed(4)} to ${maxV.toFixed(4)} (range: ${(maxV - minV).toFixed(4)})`);

    const vRange = maxV - minV;
    const vCenter = (maxV + minV) / 2;

    console.log(`\nV (height) Analysis:`);
    console.log(`  Total V range: ${vRange.toFixed(4)}`);
    console.log(`  V center: ${vCenter.toFixed(4)}`);

    // Estimate cup body area (middle 58% based on typical cup proportions)
    // Top 21% is head/lid, bottom 21% is foot/base, middle 58% is body
    const bodyStartV = minV + (vRange * 0.21);
    const bodyEndV = maxV - (vRange * 0.21);
    const bodyRangeV = bodyEndV - bodyStartV;
    const bodyCenterV = (bodyEndV + bodyStartV) / 2;
    const bodyFraction = bodyRangeV / vRange;

    console.log(`\nEstimated Body Area (middle 58%):`);
    console.log(`  Body V start: ${bodyStartV.toFixed(4)}`);
    console.log(`  Body V end: ${bodyEndV.toFixed(4)}`);
    console.log(`  Body V range: ${bodyRangeV.toFixed(4)}`);
    console.log(`  Body V center: ${bodyCenterV.toFixed(4)}`);
    console.log(`  Body as fraction of total: ${bodyFraction.toFixed(4)} (${(bodyFraction * 100).toFixed(1)}%)`);

    // Calculate UV settings
    // uvRepeatY: How many times to repeat the texture vertically
    // We want canvas (0-1) to map to body area only
    const suggestedRepeatY = vRange / bodyRangeV;

    // uvOffsetY: How to shift the texture vertically
    // We want to center the canvas on the body area
    // In Three.js, offset is applied after repeat
    // Formula: offset = -(bodyCenter - 0.5) / repeat
    const normalizedBodyCenter = (bodyCenterV - minV) / vRange;
    const suggestedOffsetY = -(normalizedBodyCenter - 0.5);

    console.log(`\n✓ Recommended UV Settings:`);
    console.log(`  uvRepeatY: ${suggestedRepeatY.toFixed(2)} (= 1 / ${(1/suggestedRepeatY).toFixed(2)})`);
    console.log(`  uvOffsetY: ${suggestedOffsetY.toFixed(2)}`);

    // Alternative calculation for uvOffsetY
    const altOffsetY = -(bodyCenterV - 0.5);
    console.log(`\n  Alternative uvOffsetY: ${altOffsetY.toFixed(2)}`);

    console.log(`\nFor config file:`);
    console.log(`  uvRepeatY: 1 / ${(1/suggestedRepeatY).toFixed(2)},`);
    console.log(`  uvOffsetY: ${suggestedOffsetY.toFixed(2)},`);

  } catch (error) {
    console.error(`Error analyzing ${fileName}:`, error.message);
    console.error(error.stack);
  }
}

async function main() {
  console.log('\n' + '█'.repeat(60));
  console.log('  GLB UV Mapping Detailed Analyzer');
  console.log('█'.repeat(60));

  const models = [
    'Handlebar- v3.glb',
    'Walrus- v3.glb',
    'General- v3.glb',
    'Magnum- v3.glb',
    'Sippy- v3.glb',
    'Zappa Wide- v3.glb',
    'Zappa Skinny- v3.glb',
  ];

  for (const modelName of models) {
    const modelPath = path.join(modelsDir, modelName);
    if (fs.existsSync(modelPath)) {
      await analyzeGLBModelDetailed(modelPath);
    } else {
      console.log(`\n⚠ Skipping ${modelName} - file not found`);
    }
  }

  console.log('\n' + '█'.repeat(60));
  console.log('  Analysis Complete - Update config with these values');
  console.log('█'.repeat(60) + '\n');
}

main().catch(console.error);
