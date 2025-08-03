import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductVariants, setSelectedVariant } from '../reudx/productVariantSlice';

export const useProductVariant = (productId) => {
  const dispatch = useDispatch();
  const { variants, loading, error } = useSelector((state) => state.productVariant);
  const [selectedVariant, setSelectedVariantLocal] = useState(null);

  const productVariants = variants[productId] || [];

  useEffect(() => {
    if (productId && !variants[productId]) {
      dispatch(fetchProductVariants(productId));
    }
  }, [productId, dispatch]);


  // useEffect(() => {
  //   if (productVariants.length > 0 && !selectedVariant) {
  //     // Set default variant
  //     const defaultVariant = productVariants[0];
  //     setSelectedVariantLocal(defaultVariant);
  //     dispatch(setSelectedVariant({ productId, variant: defaultVariant }));
  //   }
  // }, [productVariants, selectedVariant, dispatch, productId]);
  const selectVariant = (variant) => {
    setSelectedVariantLocal(variant);
    dispatch(setSelectedVariant({ productId, variant }));
  };

  const getAvailableSizes = () => {
    return [...new Set(productVariants.map(v => v.size))].filter(Boolean);
  };

  const getAvailableColors = (size) => {
    if (!size) return [];
    return [...new Set(productVariants.filter(v => v.size === size).map(v => v.color))].filter(Boolean);
  };

  const getVariantBySizeAndColor = (size, color) => {
    return productVariants.find(v => v.size === size && v.color === color);
  };

  return {
    variants: productVariants,
    selectedVariant,
    loading,
    error,
    selectVariant,
    getAvailableSizes,
    getAvailableColors,
    getVariantBySizeAndColor,
  };
}; 