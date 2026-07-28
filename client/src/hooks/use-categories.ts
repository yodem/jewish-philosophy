import { useState, useEffect } from 'react';
import { Category } from '@/types';

export const useCategories = () => {
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: 'all', label: 'כל הקטגוריות' }
  ]);
  const [fullCategories, setFullCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const categoriesData = (await response.json()) as Category[];
        const formattedCategories = [
          ...categoriesData.map((cat: Category) => ({
            value: cat.slug,
            label: cat.name
          }))
        ];
        setCategories(formattedCategories);
        setFullCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  return { categories, fullCategories, loadingCategories };
};
