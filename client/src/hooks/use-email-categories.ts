"use client";

import { useState, useEffect } from "react";
import type { EmailIssueCategory } from "@/types";

export function useEmailCategories() {
  const [emailCategories, setEmailCategories] = useState<EmailIssueCategory[]>([]);
  const [loadingEmailCategories, setLoadingEmailCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailCategories = async () => {
      try {
        setLoadingEmailCategories(true);
        const response = await fetch('/api/email-issue-categories');
        if (!response.ok) throw new Error('Failed to fetch email categories');
        const data = await response.json();
        if (data?.data) {
          setEmailCategories(data.data);
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
