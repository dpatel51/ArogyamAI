#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// API Base URL - Update this to match your backend
const API_BASE_URL = 'http://localhost:3000/api/procurement';

class MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: 'hospital-procurement-mcp',
      version: '1.0.0',
    }) as any;

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    (this.server as any).setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'list_purchase_orders',
          description: 'List all purchase orders with optional filters',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Filter by status: pending, approved, delivered, cancelled',
              },
              priority: {
                type: 'string',
                description: 'Filter by priority: normal, urgent, critical',
              },
            },
          },
        },
        {
          name: 'get_order_details',
          description: 'Get detailed information about a specific purchase order',
          inputSchema: {
            type: 'object',
            properties: {
              order_id: {
                type: 'string',
                description: 'Purchase order ID (e.g., PO-2024-001)',
              },
            },
            required: ['order_id'],
          },
        },
        {
          name: 'create_purchase_order',
          description: 'Create a new purchase order',
          inputSchema: {
            type: 'object',
            properties: {
              supplier_id: {
                type: 'string',
                description: 'Supplier ID',
              },
              items: {
                type: 'array',
                description: 'Array of items to order',
                items: {
                  type: 'object',
                  properties: {
                    item_name: { type: 'string' },
                    quantity: { type: 'number' },
                    unit_price: { type: 'number' },
                  },
                  required: ['item_name', 'quantity', 'unit_price'],
                },
              },
              priority: {
                type: 'string',
                description: 'Priority: normal, urgent, critical',
              },
              requested_by: {
                type: 'string',
                description: 'Name of person requesting',
              },
            },
            required: ['supplier_id', 'items'],
          },
        },
        {
          name: 'update_order_status',
          description: 'Update the status of a purchase order',
          inputSchema: {
            type: 'object',
            properties: {
              order_id: {
                type: 'string',
                description: 'Purchase order ID',
              },
              status: {
                type: 'string',
                description: 'New status: pending, approved, delivered, cancelled',
              },
            },
            required: ['order_id', 'status'],
          },
        },
        {
          name: 'list_suppliers',
          description: 'Whenever asked abput any supplier or all supplier user this to Get list of all active suppliers with optional item type filter',
          inputSchema: {
            type: 'object',
            properties: {
              item_type: {
                type: 'string',
                description: 'Filter by item type supplied',
              },
            },
          },
        },
        {
          name: 'add_supplier',
          description: 'Add a new supplier to the system',
          inputSchema: {
            type: 'object',
            properties: {
              supplier_id: {
                type: 'string',
                description: 'Unique supplier ID',
              },
              name: {
                type: 'string',
                description: 'Supplier name',
              },
              contact_person: {
                type: 'string',
                description: 'Contact person name',
              },
              phone: {
                type: 'string',
                description: 'Phone number',
              },
              email: {
                type: 'string',
                description: 'Email address',
              },
              items_supplied: {
                type: 'array',
                description: 'Array of items supplied',
                items: { type: 'string' },
              },
            },
            required: ['supplier_id', 'name', 'contact_person', 'phone', 'email'],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    (this.server as any).setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_purchase_orders':
            return await this.handleListOrders(args);
          case 'get_order_details':
            return await this.handleGetOrderDetails(args);
          case 'create_purchase_order':
            return await this.handleCreateOrder(args);
          case 'update_order_status':
            return await this.handleUpdateOrderStatus(args);
          case 'list_suppliers':
            return await this.handleListSuppliers(args);
          case 'add_supplier':
            return await this.handleAddSupplier(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }
// vp -> p
  private async handleListOrders(args: unknown): Promise<CallToolResult> {
    const { status, priority } = args as { status?: string; priority?: string };

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);

    const response = await fetch(`${API_BASE_URL}/orders?${params.toString()}`);
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch orders');
    }

    const orders = data.data;
    if (orders.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '📋 No purchase orders found for the specified criteria.',
          },
        ],
        isError: false,
      };
    }

    const ordersText = orders.map((order: any) => `
🔹 ${order.order_id}
   Supplier: ${order.supplier_name}
   Items: ${order.items_count}
   Total: $${order.total_amount.toFixed(2)}
   Status: ${order.status}
   Priority: ${order.priority}
   Date: ${new Date(order.requested_date).toLocaleDateString()}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `📋 Purchase Orders (${orders.length}):${ordersText}`,
        },
      ],
      isError: false,
    };
  }

  private async handleGetOrderDetails(args: unknown): Promise<CallToolResult> {
    const { order_id } = args as { order_id: string };

    const response = await fetch(`${API_BASE_URL}/orders/${order_id}`);
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Order not found');
    }

    const order = data.data;
    const itemsText = order.items.map((item: any) => `
   • ${item.item_name}
     Qty: ${item.quantity} @ $${item.unit_price} = $${item.total_price.toFixed(2)}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `📋 Order Details: ${order.order_id}

Status: ${order.status}
Priority: ${order.priority}
Requested By: ${order.requested_by}
Requested Date: ${new Date(order.requested_date).toLocaleDateString()}
Expected Delivery: ${new Date(order.expected_delivery).toLocaleDateString()}

Supplier:
${order.supplier ? `   Name: ${order.supplier.name}
   Contact: ${order.supplier.contact_person}
   Phone: ${order.supplier.phone}
   Email: ${order.supplier.email}` : '   Not specified'}

Items:${itemsText}

Total Amount: $${order.total_amount.toFixed(2)}`,
        },
      ],
      isError: false,
    };
  }

  private async handleCreateOrder(args: unknown): Promise<CallToolResult> {
    const { supplier_id, items, priority, requested_by } = args as {
      supplier_id: string;
      items: Array<{ item_name: string; quantity: number; unit_price: number }>;
      priority?: string;
      requested_by?: string;
    };

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        supplier_id,
        items,
        priority: priority || 'normal',
        requested_by: requested_by || 'Admin',
      }),
    });

    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create order');
    }

    const order = data.data;
    const itemsText = order.items.map((item: any) => `
   • ${item.item_name} - Qty: ${item.quantity} @ $${item.unit_price}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `✅ Purchase Order Created Successfully!

Order ID: ${data.order_id}
Supplier: ${order.supplier_id}
Status: ${order.status}
Priority: ${order.priority}

Items:${itemsText}

Total Amount: $${order.total_amount.toFixed(2)}
Expected Delivery: ${new Date(order.expected_delivery).toLocaleDateString()}`,
        },
      ],
      isError: false,
    };
  }

  private async handleUpdateOrderStatus(args: unknown): Promise<CallToolResult> {
    const { order_id, status } = args as { order_id: string; status: string };

    const response = await fetch(`${API_BASE_URL}/orders/${order_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update order status');
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Order Status Updated

Order ID: ${order_id}
New Status: ${status}

${data.message}`,
        },
      ],
      isError: false,
    };
  }

  private async handleListSuppliers(args: unknown): Promise<CallToolResult> {
    const { item_type } = args as { item_type?: string };

    const params = item_type ? `?item_type=${item_type}` : '';
    const response = await fetch(`${API_BASE_URL}/suppliers${params}`);
    
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || `Failed to fetch suppliers${response}`);
    }

    const suppliers = data.data;
    if (suppliers.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '🏭 No suppliers found.',
          },
        ],
        isError: false,
      };
    }

    const suppliersText = suppliers.map((supplier: any) => `
🔹 ${supplier.name} (${supplier.supplier_id})
   Contact: ${supplier.contact_person}
   Phone: ${supplier.phone}
   Email: ${supplier.email}
   Items: ${supplier.items_supplied.join(', ')}
   Rating: ${supplier.rating || 'N/A'}/5
   Avg Delivery: ${supplier.avg_delivery_days || 'N/A'} days`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `🏭 Active Suppliers (${suppliers.length}):${suppliersText}`,
        },
      ],
      isError: false,
    };
  }

  private async handleAddSupplier(args: unknown): Promise<CallToolResult> {
    const supplierData = args as {
      supplier_id: string;
      name: string;
      contact_person: string;
      phone: string;
      email: string;
      items_supplied?: string[];
    };

    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(supplierData),
    });

    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to add supplier');
    }

    const supplier = data.data;

    return {
      content: [
        {
          type: 'text',
          text: `✅ Supplier Added Successfully!

Supplier ID: ${supplier.supplier_id}
Name: ${supplier.name}
Contact Person: ${supplier.contact_person}
Phone: ${supplier.phone}
Email: ${supplier.email}
Items Supplied: ${supplier.items_supplied?.join(', ') || 'Not specified'}

${data.message}`,
        },
      ],
      isError: false,
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await (this.server as any).connect(transport);
    console.error('🏥 Hospital Procurement MCP Server started successfully');
  }
}

// Start the server
const server = new MCPServer();
server.start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});