/**
 * Image Optimization Service with Multiple Format Support
 * Sub-Phase 10.2: Core Web Vitals & Performance Optimization
 * Supports: AVIF, WebP, and responsive sizing
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Image as ImageIcon,
  Zap,
  Download,
  Eye,
  Smartphone,
  Monitor,
  HardDrive,
  Settings,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'

interface ImageOptimizationOptions {
  quality: number // 1-100
  format: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png'
  sizes: number[]
  placeholder: 'blur' | 'empty' | 'dominant'
  priority: boolean
  loading: 'lazy' | 'eager'
  compressionLevel: 'low' | 'medium' | 'high'
}

interface OptimizedImageResult {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  format: string
  dimensions: { width: number; height: number }
  url: string
  blurDataURL?: string
  loadingTime: number
}

interface ImageFormat {
  name: string
  extension: string
  mimeType: string
  support: 'full' | 'partial' | 'none'
  compression: 'excellent' | 'good' | 'fair'
  quality: 'lossless' | 'lossy'
}

// Supported image formats with metadata
const SUPPORTED_FORMATS: Record<string, ImageFormat> = {
  avif: {
    name: 'AVIF',
    extension: '.avif',
    mimeType: 'image/avif',
    support: 'modern',
    compression: 'excellent',
    quality: 'lossy',
  },
  webp: {
    name: 'WebP',
    extension: '.webp',
    mimeType: 'image/webp',
    support: 'wide',
    compression: 'good',
    quality: 'lossy',
  },
  jpeg: {
    name: 'JPEG',
    extension: '.jpg',
    mimeType: 'image/jpeg',
    support: 'universal',
    compression: 'good',
    quality: 'lossy',
  },
  png: {
    name: 'PNG',
    extension: '.png',
    mimeType: 'image/png',
    support: 'universal',
    compression: 'fair',
    quality: 'lossless',
  },
}

export class ImageOptimizationService {
  private supportedFormats: Map<string, boolean> = new Map()

  constructor() {
    this.detectFormatSupport()
  }

  private detectFormatSupport() {
    // Test browser support for different image formats
    const testImage = new Image()
    
    // Test AVIF support
    testImage.onload = testImage.onerror = () => {
      this.supportedFormats.set('avif', testImage.height === 2)
    }
    testImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1pZjFoZWlnaHQyAAAAhm'

    // Test WebP support
    testImage.onload = testImage.onerror = () => {
      this.supportedFormats.set('webp', testImage.height === 2)
    }
    testImage.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  }

  public getOptimalFormat(preferredFormats: string[] = ['avif', 'webp']): string {
    // Check browser support and return the best available format
    for (const format of preferredFormats) {
      if (this.supportedFormats.get(format) || format === 'jpeg' || format === 'png') {
        return format
      }
    }
    return 'jpeg' // Fallback
  }

  public calculateResponsiveSizes(originalWidth: number): number[] {
    // Generate responsive sizes based on common device widths
    const baseSizes = [320, 480, 640, 768, 1024, 1280, 1536, 1920]
    
    // Filter sizes that are smaller than or equal to original width
    // and add the original width as the maximum
    const sizes = baseSizes.filter(size => size <= originalWidth)
    if (originalWidth > sizes[sizes.length - 1]) {
      sizes.push(originalWidth)
    }
    
    return sizes.length > 0 ? sizes : [originalWidth]
  }

  public generateSrcSet(baseUrl: string, widths: number[], format: string): string {
    return widths
      .map(width => `${baseUrl}?w=${width}&q=75&format=${format} ${width}w`)
      .join(', ')
  }

  public async optimizeImage(
    src: string,
    options: ImageOptimizationOptions
  ): Promise<OptimizedImageResult> {
    const startTime = performance.now()
    
    // Simulate image optimization (in real implementation, this would call an optimization API)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const loadTime = performance.now() - startTime
    
    // Get image dimensions (in real implementation, this would be done by the optimization service)
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
    
    const dimensions = { width: img.width, height: img.height }
    
    // Mock optimization results (in real implementation, these would come from the optimization service)
    const originalSize = dimensions.width * dimensions.height * 3 // Assume RGB
    const qualityMultiplier = options.quality / 100
    const formatMultiplier = options.format === 'avif' ? 0.3 : options.format === 'webp' ? 0.4 : 0.6
    const optimizedSize = originalSize * qualityMultiplier * formatMultiplier
    
    return {
      originalSize,
      optimizedSize,
      compressionRatio: (originalSize - optimizedSize) / originalSize,
      format: options.format,
      dimensions,
      url: src,
      loadingTime: loadTime,
    }
  }

  public validateOptimization(options: ImageOptimizationOptions): {
    isValid: boolean
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []
    let isValid = true

    // Quality validation
    if (options.quality < 30) {
      warnings.push('Quality below 30% may result in poor visual quality')
      suggestions.push('Increase quality to at least 60-80% for better visual quality')
    } else if (options.quality > 90) {
      suggestions.push('Quality above 90% may not provide significant benefit for file size')
    }

    // Format validation
    if (options.format === 'auto') {
      suggestions.push('Auto format selection will choose the best format for each browser')
    }

    // Size validation
    if (options.sizes.length === 0) {
      warnings.push('No responsive sizes specified')
      suggestions.push('Specify multiple sizes for responsive images')
    }

    // Compression level validation
    if (options.compressionLevel === 'high' && options.quality > 80) {
      suggestions.push('High compression with high quality may be inefficient')
    }

    return { isValid, warnings, suggestions }
  }
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = 'blur',
  quality = 75,
  sizes,
  ...props
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty' | 'dominant'
  quality?: number
  sizes?: string
} & React.ComponentProps<typeof Image>) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [loadStartTime, setLoadStartTime] = useState<number>(0)

  useEffect(() => {
    if (priority) {
      setLoadStartTime(performance.now())
    }
  }, [priority])

  const handleLoad = useCallback(() => {
    setImageLoaded(true)
    if (loadStartTime > 0) {
      const loadTime = performance.now() - loadStartTime
      console.log(`Image loaded in ${loadTime.toFixed(2)}ms`)
    }
  }, [loadStartTime])

  const handleError = useCallback(() => {
    setImageError(true)
  }, [])

  const imageOptimizationService = useMemo(() => new ImageOptimizationService(), [])
  const optimalFormat = imageOptimizationService.getOptimalFormat()

  const generateSrcSet = useCallback((baseSrc: string, imgWidth?: number) => {
    if (!imgWidth) return ''
    
    const responsiveSizes = imageOptimizationService.calculateResponsiveSizes(imgWidth)
    return imageOptimizationService.generateSrcSet(baseSrc, responsiveSizes, optimalFormat)
  }, [optimalFormat, imageOptimizationService])

  const srcSet = width ? generateSrcSet(src, width) : undefined

  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && placeholder !== 'empty' && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center`}>
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        priority={priority}
        placeholder={placeholder}
        quality={quality}
        {...props}
      />
    </div>
  )
}

export function ImageOptimizationDemo() {
  const [options, setOptions] = useState<ImageOptimizationOptions>({
    quality: 75,
    format: 'auto',
    sizes: [320, 640, 768, 1024, 1280, 1920],
    placeholder: 'blur',
    priority: false,
    loading: 'lazy',
    compressionLevel: 'medium',
  })

  const [result, setResult] = useState<OptimizedImageResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [validation, setValidation] = useState<any>(null)

  const optimizationService = useMemo(() => new ImageOptimizationService(), [])

  useEffect(() => {
    const validationResult = optimizationService.validateOptimization(options)
    setValidation(validationResult)
  }, [options, optimizationService])

  const handleOptimize = useCallback(async () => {
    setIsOptimizing(true)
    try {
      const optimizationResult = await optimizationService.optimizeImage(
        '/api/placeholder/800/600',
        options
      )
      setResult(optimizationResult)
    } catch (error) {
      console.error('Image optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }, [options, optimizationService])

  const imageOptimizationService = useMemo(() => new ImageOptimizationService(), [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Image Optimization Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Format Support */}
            <div>
              <h4 className="font-semibold mb-3">Format Support</h4>
              <div className="space-y-2">
                {Object.entries(SUPPORTED_FORMATS).map(([key, format]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{format.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={
                        format.support === 'universal' ? 'bg-green-100 text-green-700' :
                        format.support === 'wide' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {format.support}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Settings */}
            <div>
              <h4 className="font-semibold mb-3">Settings</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Quality: {options.quality}%</label>
                  <Slider
                    value={[options.quality]}
                    onValueChange={([value]) => setOptions(prev => ({ ...prev, quality: value }))}
                    max={100}
                    min={10}
                    step={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Format</label>
                  <Select
                    value={options.format}
                    onValueChange={(value: any) => setOptions(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="avif">AVIF</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Compression</label>
                  <Select
                    value={options.compressionLevel}
                    onValueChange={(value: any) => setOptions(prev => ({ ...prev, compressionLevel: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Higher Quality)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Smaller Size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Validation */}
            <div>
              <h4 className="font-semibold mb-3">Validation</h4>
              {validation && (
                <div className="space-y-2">
                  {validation.warnings.map((warning: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-yellow-600">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {warning}
                    </div>
                  ))}
                  {validation.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-blue-600">
                      <Settings className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button 
              onClick={handleOptimize} 
              disabled={isOptimizing}
              className="flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Optimize Image
                </>
              )}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {((1 - result.compressionRatio) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Size Reduction</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(result.originalSize / 1024).toFixed(1)} KB
                </div>
                <div className="text-sm text-gray-600">Original Size</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(result.optimizedSize / 1024).toFixed(1)} KB
                </div>
                <div className="text-sm text-gray-600">Optimized Size</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {result.loadingTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">Load Time</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  Successfully optimized with {result.format.toUpperCase()} format
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Image dimensions: {result.dimensions.width} × {result.dimensions.height} pixels
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Image */}
      <Card>
        <CardHeader>
          <CardTitle>Image Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <OptimizedImage
              src="/api/placeholder/800/600"
              alt="Demo image"
              width={800}
              height={600}
              className="w-full h-auto rounded-lg"
              priority={options.priority}
              placeholder={options.placeholder}
              quality={options.quality}
            />
            
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90">
                {options.format.toUpperCase()} @ {options.quality}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { ImageOptimizationService }
export type { ImageOptimizationOptions, OptimizedImageResult, ImageFormat }
