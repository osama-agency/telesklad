"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Heart, User, Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Собственный debounce, чтобы не тянуть lodash
  const debouncedSearch = useCallback(
    (q: string) => {
      // @ts-ignore-next-line
      clearTimeout(window.__tgapp_search_timer);
      // @ts-ignore-next-line
      window.__tgapp_search_timer = setTimeout(() => onSearch(q), 400);
    },
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="tgapp-search-bar">
      <Search className="tgapp-search-icon" />
      <input
        className="tgapp-search-input"
        type="text"
        placeholder="Поиск товаров"
        value={query}
        onChange={handleChange}
      />
      <button
        className="tgapp-nav-button"
        aria-label="Избранное"
        onClick={() => router.push("/tgapp/favorites")}
      >
        <Heart className="w-5 h-5 text-gray-500" />
      </button>
      <button
        className="tgapp-nav-button"
        aria-label="Профиль"
        onClick={() => router.push("/tgapp/profile")}
      >
        <User className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
} 