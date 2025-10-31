import type { Pattern } from '~/store/background'

/**
 * Load background patterns from public/backgrounds folder
 * Organized by collection: general, greek, furman
 */

export interface BackgroundImage {
  id: string
  name: string
  category: string
  collection: string
  preview: string
  path: string
}

/**
 * Scan backgrounds folder and generate pattern objects
 */
export async function loadBackgroundsForCollection(collectionId: string = 'general'): Promise<Pattern[]> {
  const basePath = `/backgrounds/${collectionId}`

  // Map of background images by collection
  const backgroundMappings: Record<string, string[]> = {
    general: [
      'dans abstract 1 copy.jpg',
      'dans abstract 2 copy.jpg',
      'dans abstract 3 copy.jpg',
      'dans abstract 4 copy.jpg',
      'dans abstract 5 copy.jpg',
      'dans abstract 6 copy.jpg',
      'dans abstract 7 copy.jpg',
      'dans abstract 8 copy.jpg',
      'dans abstract 9 copy.jpg',
      'dans abstract 10 copy.jpg',
      'dans abstract 11 copy.jpg',
      'dans abstract 12 copy.jpg',
      'dans abstract 13 copy.jpg',
      'dans abstract 14 copy.jpg',
      'dans abstract 15 copy.jpg',
      'dans abstract 16 copy.jpg',
      'dans abstract 17 copy.jpg',
      'dans abstract 18 copy.jpg',
      'dans abstract 19 copy.jpg',
      'dans abstract 20 copy.jpg',
    ],
    greek: [
      'ADPi-Patterns-Adelphean-Diamond-Horizontal_Diamond_Horizontal_4.png',
      'ADPi-Patterns-Midnight-Diamond-Horizontal_Diamond_Horizontal_1.png',
      'ADPi-Patterns-Diamond-Horizon_Diamond_Horizontal_Diamond_Horizontal_3.jpg',
      'ADPi-Patterns-Sand-Alphie.png',
      'ADPi-Patterns-Midnight-Alphie_Lion_1.png',
      'ADPi-Patterns-Adelphean-Alphie.png',
    ],
    furman: [
      '1.png',
      '2.png',
      '3.png',
      '4.png',
      '5.png',
      'F.png',
    ],
  }

  const files = backgroundMappings[collectionId] || backgroundMappings.general

  const patterns: Pattern[] = files.map((filename, index) => {
    // Get category from filename or index
    let category = 'Abstract'
    if (filename.includes('Diamond') || filename.includes('Pattern')) {
      category = 'Geometric'
    } else if (filename.includes('abstract')) {
      category = 'Abstract'
    } else if (filename.match(/^\d/)) {
      category = 'Watercolor'
    }

    // Generate clean pattern name
    let name = filename.replace(/\.(jpg|png|jpeg)$/i, '')

    // Special handling for different collections
    if (collectionId === 'furman') {
      name = `Furman ${name.toUpperCase()}`
    } else if (collectionId === 'greek') {
      name = name.replace(/ADPi-Patterns-/gi, '').replace(/_/g, ' ')
    } else {
      name = name.replace(/dans abstract/gi, 'Pattern').replace(/copy/gi, '').replace(/\s+/g, ' ').trim()
    }

    return {
      id: `${collectionId}-bg-${index + 1}`,
      name: name.trim() || `Pattern ${index + 1}`,
      category,
      type: 'image' as const,
      preview: `${basePath}/${filename}`,
      config: {
        imageUrl: `${basePath}/${filename}`,
      },
    }
  })

  return patterns
}
