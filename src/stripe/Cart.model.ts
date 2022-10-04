interface CartItem {
  name: string;
  price: number;
  qty: number;
  desct: string;
  _id: string;
  __v: number;
}

export type Cart = CartItem;
