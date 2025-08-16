import { useCallback, useRef, useState } from 'react';
import {
    getPersonalizedProducts,
    getProductSuggestions,
    getRelatedProducts,
    getTrendingProducts
} from '../utils/api';

export const useProductSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  // Debounced search suggestions
  const searchSuggestions = useCallback(async (keyword, limit = 8) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!keyword || keyword.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getProductSuggestions(keyword.trim(), limit);
        if (response.success) {
          setSuggestions(response.suggestions || []);
        } else {
          setError('Không thể tải gợi ý');
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setError('Lỗi khi tải gợi ý');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchSuggestions,
    clearSuggestions
  };
};

export const useRelatedProducts = () => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRelatedProducts = useCallback(async (productId, limit = 6) => {
    if (!productId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await getRelatedProducts(productId, limit);
      if (response.success) {
        setRelatedProducts(response.relatedProducts || []);
      } else {
        setError('Không thể tải sản phẩm liên quan');
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
      setError('Lỗi khi tải sản phẩm liên quan');
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    relatedProducts,
    loading,
    error,
    fetchRelatedProducts
  };
};

export const useTrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrendingProducts = useCallback(async (limit = 10, timeRange = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTrendingProducts(limit, timeRange);
      if (response.success) {
        setTrendingProducts(response.trendingProducts || []);
      } else {
        setError('Không thể tải sản phẩm phổ biến');
      }
    } catch (err) {
      console.error('Error fetching trending products:', err);
      setError('Lỗi khi tải sản phẩm phổ biến');
      setTrendingProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trendingProducts,
    loading,
    error,
    fetchTrendingProducts
  };
};

export const usePersonalizedProducts = () => {
  const [personalizedProducts, setPersonalizedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPersonalizedProducts = useCallback(async (userId, limit = 8) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await getPersonalizedProducts(userId, limit);
      if (response.success) {
        setPersonalizedProducts(response.personalizedProducts || []);
      } else {
        setError('Không thể tải gợi ý cá nhân');
      }
    } catch (err) {
      console.error('Error fetching personalized products:', err);
      setError('Lỗi khi tải gợi ý cá nhân');
      setPersonalizedProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    personalizedProducts,
    loading,
    error,
    fetchPersonalizedProducts
  };
};
