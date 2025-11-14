const fs = require('fs');
const path = require('path');

// This script analyzes GLB models to understand their UV mapping
// It helps calculate the correct uvRepeatY and uvOffsetY values

const modelsDir = path.join(__dirname, '../public/models');

async function analyzeGLBModel(filePath) {
  const fileName = path.basename(filePath, '.glb');
  console.log(`\n=== Analyzing: ${fileName} ===`);

  try {
    const buffer = fs.readFileSync(filePath);
    const jsonChunkStart = 20; // GLB header is 12 bytes + JSON chunk header is 8 bytes

    // Read JSON chunk length (bytes 12-15)
    const jsonLength = buffer.readUInt32LE(12);

    // Extract JSON chunk
    const jsonChunk = buffer.slice(jsonChunkStart, jsonChunkStart + jsonLength);
    const gltf = JSON.parse(jsonChunk.toString('utf-8'));

    console.log(`File: ${fileName}`);
    console.log(`Meshes: ${gltf.meshes ? gltf.meshes.length : 0}`);
    console.log(`Materials: ${gltf.materials ? gltf.materials.length : 0}`);

    // Check for UV coordinates (TEXCOORD_0)
    if (gltf.meshes && gltf.meshes.length > 0) {
      const mainMesh = gltf.meshes[0];
      if (mainMesh.primitives && mainMesh.primitives.length > 0) {
        const primitive = mainMesh.primitives[0];
        console.log('Attributes:', Object.keys(primitive.attributes || {}));

        // Get UV accessor info
        if (primitive.attributes && primitive.attributes.TEXCOORD_0 !== undefined) {
          const uvAccessorIndex = primitive.attributes.TEXCOORD_0;
          const uvAccessor = gltf.accessors[uvAccessorIndex];

          console.log('UV Accessor:', {
            type: uvAccessor.type,
            count: uvAccessor.count,
            min: uvAccessor.min,
            max: uvAccessor.max,
          });

          // Calculate UV range
          if (uvAccessor.min && uvAccessor.max) {
            const uvRangeY = uvAccessor.max[1] - uvAccessor.min[1];
            const uvCenterY = (uvAccessor.max[1] + uvAccessor.min[1]) / 2;

            console.log(`\nUV Analysis:`);
            console.log(`  Y Range: ${uvAccessor.min[1].toFixed(4)} to ${uvAccessor.max[1].toFixed(4)}`);
            console.log(`  Y Total Range: ${uvRangeY.toFixed(4)}`);
            console.log(`  Y Center: ${uvCenterY.toFixed(4)}`);

            // Estimate body area (assuming head is top 20%, foot is bottom 20%)
            const bodyStartY = uvAccessor.min[1] + (uvRangeY * 0.20);
            const bodyEndY = uvAccessor.max[1] - (uvRangeY * 0.20);
            const bodyRangeY = bodyEndY - bodyStartY;
            const bodyCenterY = (bodyEndY + bodyStartY) / 2;

            console.log(`\nEstimated Body Area (middle 60%):`);
            console.log(`  Body Start Y: ${bodyStartY.toFixed(4)}`);
            console.log(`  Body End Y: ${bodyEndY.toFixed(4)}`);
            console.log(`  Body Range Y: ${bodyRangeY.toFixed(4)}`);
            console.log(`  Body Center Y: ${bodyCenterY.toFixed(4)}`);

            // Calculate suggested UV settings
            // uvRepeatY = 1 / (body range as fraction of total UV space)
            const bodyFraction = bodyRangeY / 1.0; // Assuming UV space is 0-1
            const suggestedRepeatY = 1 / bodyFraction;

            // uvOffsetY to center canvas on body
            // Need to shift so canvas center aligns with body center
            const suggestedOffsetY = -(bodyCenterY - 0.5);

            console.log(`\nSuggested UV Settings:`);
            console.log(`  uvRepeatY: 1 / ${bodyFraction.toFixed(2)} = ${suggestedRepeatY.toFixed(2)}`);
            console.log(`  uvOffsetY: ${suggestedOffsetY.toFixed(2)}`);
          }
        }
      }
    }

    // Check material properties
    if (gltf.materials && gltf.materials.length > 0) {
      console.log('\nMaterials:');
      gltf.materials.forEach((material, idx) => {
        console.log(`  [${idx}] ${material.name || 'Unnamed'}`);
        if (material.pbrMetallicRoughness) {
          console.log(`      Has PBR: metallicFactor=${material.pbrMetallicRoughness.metallicFactor}`);
        }
      });
    }

  } catch (error) {
    console.error(`Error analyzing ${fileName}:`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('GLB UV Mapping Analyzer');
  console.log('='.repeat(60));

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
      await analyzeGLBModel(modelPath);
    } else {
      console.log(`\nSkipping ${modelName} - file not found`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Analysis Complete');
  console.log('='.repeat(60));
}

main().catch(console.error);
