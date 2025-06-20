'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { IconComponent } from '@/components/webapp/IconComponent'
import { AddToCartButton } from '@/app/webapp/_components/AddToCartButton'
import { FavoriteButton } from '@/app/webapp/_components/FavoriteButton'
import { ReviewsList } from '@/app/webapp/_components/ReviewsList'
import { ReviewForm } from '@/app/webapp/_components/ReviewForm'
import LoadingSpinner from '@/app/webapp/_components/LoadingSpinner'

interface Product {
  id: number
  name: string
  price: number
  old_price?: number
  stock_quantity: number
  brand?: string
  weight?: string
  dosage_form?: string
  package_quantity?: string
  main_ingredient?: string
  description?: string
  image_url?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewsKey, setReviewsKey] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/webapp/products/${productId}`)
        if (!response.ok) {
          throw new Error('Product not found')
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleReviewFormShow = () => {
    setShowReviewForm(true)
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    setReviewsKey(prev => prev + 1) // Обновляем отзывы
  }

  const handleReviewCancel = () => {
    setShowReviewForm(false)
  }

  if (loading) {
    return (
      <div className="webapp-container">
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="webapp-container">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-xl font-semibold mb-4">Товар не найден</h1>
          <button 
            onClick={() => router.back()}
            className="webapp-btn"
          >
            Вернуться
          </button>
        </div>
      </div>
    )
  }

  const properties = [
    { key: 'brand', label: 'Производитель', value: product.brand },
    { key: 'weight', label: 'Вес', value: product.weight },
    { key: 'dosage_form', label: 'Форма выпуска', value: product.dosage_form },
    { key: 'package_quantity', label: 'Количество в упаковке', value: product.package_quantity },
    { key: 'main_ingredient', label: 'Основное вещество', value: product.main_ingredient },
  ].filter(prop => prop.value)

  const discountPercent = product.old_price && product.old_price > product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null

  return (
    <div className="webapp-container">
      <style jsx>{`
        body { background-color: white; }
        .btn { padding: 18px; border-radius: 20px; }
      `}</style>

      <div className="card-main-block">
        {/* Breadcrumb */}
        <ul className="breadcrumb">
          <li>
            <button 
              onClick={() => router.push('/webapp')}
              className="text-sm font-medium opacity-60 hover:opacity-100 hover:text-green-600"
            >
              Каталог
            </button>
          </li>
          <li className="text-sm font-medium">{product.name}</li>
        </ul>

        {/* Product Image */}
        <div className="product-img">
          <div 
            role="status" 
            className="flex justify-center space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
          >
            <div className="flex items-center justify-center w-full h-58">
              <IconComponent name="no-image" size={40} />
            </div>
          </div>
          {product.image_url && (
            <div 
              className="img absolute left-0 top-0 w-full h-full"
              style={{
                backgroundImage: `url('${product.image_url}')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />
          )}
        </div>
      </div>

      <div className="card-block mb-3">
        <div className="flex justify-between mb-3">
          <div>
            <div className="font-semibold text-base leading-tight mb-1">
              {product.name}
            </div>
            {product.stock_quantity > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="have-product-ico">
                  <IconComponent name="checked" size={10} />
                </div>
                <div className="have-product">В наличии</div>
              </div>
            ) : (
              <div className="no-have-product">Нет в наличии</div>
            )}
          </div>
          <div className="card-favorite">
            <FavoriteButton productId={product.id} />
          </div>
        </div>

        {product.stock_quantity > 0 && (
          <div className="mb-3 flex items-end gap-1">
            {product.old_price && (
              <div className="card-old-price">
                {product.old_price.toFixed(0)}₽
              </div>
            )}
            <div className="card-price">
              {product.price.toFixed(0)}₽
              {discountPercent && (
                <span className="price-percent">-{discountPercent}%</span>
              )}
            </div>
          </div>
        )}

        {product.stock_quantity > 0 ? (
          <AddToCartButton 
            productId={product.id} 
            productName={product.name}
            productPrice={product.price}
            maxQuantity={product.stock_quantity}
            imageUrl={product.image_url}
          />
        ) : (
          <button className="btn btn-disable">
            Уведомить о поступлении
          </button>
        )}
      </div>

      {/* Product Properties */}
      {properties.length > 0 && (
        <div className="card-block mb-3">
          <div className="title-card">О товаре</div>
          <ul className="properties-list">
            {properties.map((property) => (
              <li key={property.key} className="flex justify-between mb-3">
                <div 
                  className="variable"
                  style={{ width: property.key === 'package_quantity' ? '99px' : undefined }}
                >
                  {property.label}:
                </div>
                <div className="value">{property.value}</div>
              </li>
            ))}
          </ul>

          {product.description && (
            <>
              <div className="product-description-line" />
              <div className="title-card">Описание</div>
              <div className="product-description">
                {product.description}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reviews Section */}
      {showReviewForm ? (
        <div className="card-block">
          <ReviewForm
            productId={product.id}
            productName={product.name}
            onSuccess={handleReviewSuccess}
            onCancel={handleReviewCancel}
          />
        </div>
      ) : (
        <ReviewsList
          key={reviewsKey}
          productId={product.id}
          onReviewCreate={handleReviewFormShow}
        />
      )}
    </div>
  )
} 