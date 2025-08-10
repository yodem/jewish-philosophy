import { useState, useEffect } from 'react';
import { getAllCategories } from '@/data/services';
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
        const categoriesData = await getAllCategories();
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