import { API_BASE_URL, API_KEY } from "./apiConfig";

export const fetchProducts = async (searchQuery) => {
  const url = `${API_BASE_URL}products?search=${encodeURIComponent(
    searchQuery
  )}&sort=price_desc`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error("API-kall feilet");
  }
  return await response.json();
};
