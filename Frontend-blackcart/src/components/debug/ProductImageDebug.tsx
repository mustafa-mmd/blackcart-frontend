import React from 'react'
import { productService } from '../../services/productService'

interface ProductImageDebugProps {
  products: any[]
}

const ProductImageDebug: React.FC<ProductImageDebugProps> = ({ products }) => {
  React.useEffect(() => {
    if (!products || products.length === 0) {
      console.log('📭 No products to debug')
      return
    }

    console.log('🔍 PRODUCT IMAGE DEBUG ======================')
    
    products.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.name}`)
      console.log('   ID:', product._id)
      console.log('   Images in database:', product.images)
      console.log('   Image URLs:')
      
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((img: any, imgIndex: number) => {
          const url = productService.getImageUrl(img)
          console.log(`     ${imgIndex + 1}. ${url}`)
          
          // Test if image loads
          const testImg = new Image()
          testImg.src = url
          testImg.onload = () => console.log(`       ✅ Loads successfully`)
          testImg.onerror = () => console.log(`       ❌ Fails to load`)
        })
      } else {
        console.log('     ❌ No images array in product data')
      }
      
      console.log('   Primary Image URL:', productService.getPrimaryImageUrl(product))
    })
    
    console.log('==========================================')
  }, [products])

  return null
}

export default ProductImageDebug