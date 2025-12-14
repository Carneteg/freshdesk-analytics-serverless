const FRESHDESK_DOMAIN = process.env.FRESHDESK_DOMAIN!;
const FRESHDESK_API_KEY = process.env.FRESHDESK_API_KEY!;

if (!FRESHDESK_DOMAIN || !FRESHDESK_API_KEY) {
  throw new Error('FRESHDESK_DOMAIN and FRESHDESK_API_KEY must be set');
}

export interface FreshdeskTicket {
  id: number;
  subject: string;
  description: string;
  status: number;
  priority: number;
  created_at: string;
  updated_at: string;
  due_by: string | null;
  fr_due_by: string | null;
  tags: string[];
  type: string | null;
  source: number;
  responder_id: number | null;
  requester_id: number;
  group_id: number | null;
}

export interface FreshdeskConversation {
  id: number;
  body: string;
  created_at: string;
  incoming: boolean;
  user_id: number;
  private: boolean;
}

export async function freshdeskFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `https://${FRESHDESK_DOMAIN}/api/v2${path}`;
  const auth = Buffer.from(`${FRESHDESK_API_KEY}:X`).toString('base64');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Freshdesk error: ${response.status}`);
  }
  return response.json();
}

export async function fetchTickets(params: Record<string, string> = {}): Promise<FreshdeskTicket[]> {
  const queryString = new URLSearchParams(params).toString();
  return freshdeskFetch(`/tickets${queryString ? `?${queryString}` : ''}`);
}

export async function fetchTicketConversations(ticketId: number): Promise<FreshdeskConversation[]> {
  return freshdeskFetch(`/tickets/${ticketId}/conversations`);
}
