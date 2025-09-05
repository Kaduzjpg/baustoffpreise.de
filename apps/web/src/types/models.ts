// Zentrale Modell-Typen für das Web-Frontend

export type Category = { id: number; name: string; slug: string };
export type Subcategory = { id: number; categoryId: number; name: string; slug: string };

export type Product = {
  id: number;
  categoryId?: number;
  name: string;
  slug: string;
  unit?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  keywords?: string | null;
};

export type ProductVariant = {
  id: number;
  productId: number;
  format?: string | null;
  variant?: string | null;
  unit?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
};

export type Dealer = {
  id: number;
  name: string;
  email?: string;
  zip?: string;
  city?: string;
  street?: string;
  radiusKm?: number | null;
  lat?: number | null;
  lng?: number | null;
};

export type InquiryItem = {
  productId: number;
  quantity: number;
  note?: string;
  format?: string | null;
  variant?: string | null;
};


