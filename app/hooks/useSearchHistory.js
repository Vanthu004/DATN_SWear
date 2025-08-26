import { useCallback, useRef, useState } from 'react';
import {
    addSearchHistory,
    deleteSearchHistory,
    getPopularKeywords,
    getRealtimePopularKeywords,
    getRecentSearchHistory,
    getSearchSuggestions
} from '../utils/api';

export const useSearchHistory = () => {
  const [popularKeywords, setPopularKeywords] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  // Lấy từ khóa phổ biến
  const fetchPopularKeywords = useCallback(async (limit = 8, timeRange = 'week') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPopularKeywords(limit, timeRange);
      if (response.success) {
        setPopularKeywords(response.data || []);
      } else {
        setError('Không thể tải từ khóa phổ biến');
      }
    } catch (err) {
      console.error('Error fetching popular keywords:', err);
      setError('Lỗi khi tải từ khóa phổ biến');
      setPopularKeywords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy lịch sử tìm kiếm gần đây
  const fetchRecentHistory = useCallback(async (limit = 5) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getRecentSearchHistory(limit);
      if (response.success) {
        setRecentHistory(response.data || []);
      } else {
        setError('Không thể tải lịch sử tìm kiếm');
      }
    } catch (err) {
      console.error('Error fetching recent history:', err);
      setError('Lỗi khi tải lịch sử tìm kiếm');
      setRecentHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search suggestions
  const fetchSearchSuggestions = useCallback(async (keyword, limit = 5) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!keyword || keyword.trim().length < 2) {
      setSearchSuggestions([]);
      setError(null);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getSearchSuggestions(keyword.trim(), limit);
        if (response.success) {
          setSearchSuggestions(response.data || []);
        } else {
          setError('Không thể tải gợi ý');
        }
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
        setError('Lỗi khi tải gợi ý');
        setSearchSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Thêm lịch sử tìm kiếm
  const addToSearchHistory = useCallback(async (searchData) => {
    try {
      const response = await addSearchHistory(searchData);
      if (response.success) {
        // Refresh recent history after adding
        fetchRecentHistory();
      }
      return response;
    } catch (err) {
      console.error('Error adding search history:', err);
      throw err;
    }
  }, [fetchRecentHistory]);

  // Xóa lịch sử tìm kiếm
  const removeFromSearchHistory = useCallback(async (keyword = null) => {
    try {
      const response = await deleteSearchHistory(keyword);
      if (response.success) {
        // Refresh recent history after deleting
        fetchRecentHistory();
      }
      return response;
    } catch (err) {
      console.error('Error deleting search history:', err);
      throw err;
    }
  }, [fetchRecentHistory]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSearchSuggestions([]);
    setError(null);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return {
    popularKeywords,
    recentHistory,
    searchSuggestions,
    loading,
    error,
    fetchPopularKeywords,
    fetchRecentHistory,
    fetchSearchSuggestions,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSuggestions
  };
};

export const useRealtimePopularKeywords = () => {
  const [realtimeKeywords, setRealtimeKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRealtimeKeywords = useCallback(async (limit = 10, hours = 24) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getRealtimePopularKeywords(limit, hours);
      if (response.success) {
        setRealtimeKeywords(response.data || []);
      } else {
        setError('Không thể tải từ khóa thời gian thực');
      }
    } catch (err) {
      console.error('Error fetching realtime keywords:', err);
      setError('Lỗi khi tải từ khóa thời gian thực');
      setRealtimeKeywords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    realtimeKeywords,
    loading,
    error,
    fetchRealtimeKeywords
  };
};
