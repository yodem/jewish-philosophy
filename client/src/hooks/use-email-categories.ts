"use client";

import { useState, useEffect } from "react";
import { getEmailIssueCategories } from "@/data/loaders";
import type { EmailIssueCategory } from "@/types";

export function useEmailCategories() {
  const [emailCategories, setEmailCategories] = useState<EmailIssueCategory[]>([]);
  const [loadingEmailCategories, setLoadingEmailCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailCategories = async () => {
      try {
        setLoadingEmailCategories(true);
        const response = await getEmailIssueCategories();
        if (response?.data) {
          setEmailCategories(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load email categories');
      } finally {
        setLoadingEmailCategories(false);
      }
    };

    fetchEmailCategories();
  }, []);

  return {
    emailCategories,
    loadingEmailCategories,
    error
  };
}
