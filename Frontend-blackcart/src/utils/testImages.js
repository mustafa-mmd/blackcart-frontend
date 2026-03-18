// Test utility for debugging images
export const testImageUrls = (product) => {
  console.log('🔍 Testing image URLs for product:', product.name)
  console.log('📦 Product images:', product.images)
  
  if (!product.images || !Array.isArray(product.images)) {
    console.log('❌ No images array found')
    return
  }
  
  product.images.forEach((img, index) => {
    console.log(`\n🖼️ Image ${index + 1}:`)
    console.log('  Type:', typeof img)
    console.log('  Data:', img)
    
    if (typeof img === 'string') {
      console.log('  Is full URL:', img.startsWith('http'))
      console.log('  Starts with /uploads:', img.startsWith('/uploads'))
      console.log('  Direct URL:', `https://blackcart-backend.onrender.com${img.startsWith('/') ? '' : '/'}${img}`)
    }
    
    if (typeof img === 'object') {
      console.log('  Object keys:', Object.keys(img))
      console.log('  url property:', img.url)
      console.log('  public_id property:', img.public_id)
    }
  })
}

// Test if image loads
export const testImageLoad = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      console.log(`✅ Image loads successfully: ${url}`)
      resolve(true)
    }
    img.onerror = () => {
      console.log(`❌ Image fails to load: ${url}`)
      resolve(false)
    }
    img.src = url
  })
}