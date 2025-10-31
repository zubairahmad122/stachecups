import type { Pattern } from '~/store/background'

export const collectionPatterns: Record<string, Pattern[]> = {
  general: [
    {
      id: 'abstract-1',
      name: 'Abstract 1',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 1 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-2',
      name: 'Abstract 2',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 2 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-3',
      name: 'Abstract 3',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 3 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-4',
      name: 'Abstract 4',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 4 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-5',
      name: 'Abstract 5',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 5 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-6',
      name: 'Abstract 6',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 6 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-7',
      name: 'Abstract 7',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 7 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-8',
      name: 'Abstract 8',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 8 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-9',
      name: 'Abstract 9',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 9 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-10',
      name: 'Abstract 10',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 10 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-11',
      name: 'Abstract 11',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 11 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-12',
      name: 'Abstract 12',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 12 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-13',
      name: 'Abstract 13',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 13 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-14',
      name: 'Abstract 14',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 14 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-15',
      name: 'Abstract 15',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 15 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-16',
      name: 'Abstract 16',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 16 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-17',
      name: 'Abstract 17',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 17 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-18',
      name: 'Abstract 18',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 18 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-19',
      name: 'Abstract 19',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 19 copy.jpg',
      config: {}
    },
    {
      id: 'abstract-20',
      name: 'Abstract 20',
      category: 'Abstract',
      type: 'image',
      preview: '/backgrounds/abstract background patterns/dans abstract 20 copy.jpg',
      config: {}
    },
    {
      id: 'garden-1',
      name: 'Garden Cover',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/1 Cover copy.jpg',
      config: {}
    },
    {
      id: 'garden-2',
      name: 'Garden 2',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/2 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-3',
      name: 'Garden 3',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/3 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-4',
      name: 'Garden 4',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/4 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-5',
      name: 'Garden 5',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/5 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-6',
      name: 'Garden 6',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/6 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-7',
      name: 'Garden 7',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/7 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-8',
      name: 'Garden 8',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/8 Inside Pages copy.jpg',
      config: {}
    },
    {
      id: 'garden-11',
      name: 'Garden Envelope',
      category: 'Nature',
      type: 'image',
      preview: '/backgrounds/secret garden/11 Envelope copy.jpg',
      config: {}
    },
  ],
  greek: [],
  furman: [],
}

export const defaultPatterns: Pattern[] = collectionPatterns.general

export function initializePatternsForCollection(collectionId: string = 'general'): Pattern[] {
  return collectionPatterns[collectionId] || collectionPatterns.general
}

export function initializePatterns(): Pattern[] {
  return initializePatternsForCollection('general')
}
