export interface Order {
  id: string | number;
  shipping_status: "unpacked" | "unshipped" | "shipped";
  number: number;
  customer_name: string;
  order_date: string;
  status: "unpacked" | "unshipped" | "shipped";
  days_in_ready_to_pack: number;
  is_delayed: boolean;
  note: string | null;
  attention: boolean;
  created_at: string;
  total: number;
  currency: string;
  label_printed_at?: string | null; // etiqueta Nuvem Envio impressa pelo robô
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface OrderStats {
  totalOrders: number;
  totalUnpacked: number;
  totalUnshipped: number;
  totalReadyToPack: number;
  totalSent: number;
  totalDelayed: number;
  totalAttention: number;
  lastUpdated: string;
}

export interface LabelPrint {
  pedido: string;
  impresso_em: string;
  valor_total_rodada: number | null;
  etiquetas: string[];
}
