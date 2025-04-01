
export type Category = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type StockItem = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  user_id: string;
  photos: string[];
  created_at: string;
  updated_at: string;
};
