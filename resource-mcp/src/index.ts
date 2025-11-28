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
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/resources';

class MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: 'hospital-resource-management-mcp',
      version: '1.0.0',
    }) as any;

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    (this.server as any).setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'get_staffing',
          description: 'Get staffing information with optional filters',
          inputSchema: {
            type: 'object',
            properties: {
              department: {
                type: 'string',
                description: 'Filter by department',
              },
              shift: {
                type: 'string',
                description: 'Filter by shift (morning, evening, night)',
              },
            },
          },
        },
        {
          name: 'get_inventory',
          description: 'Get inventory information with optional low stock filtering',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Filter by category (e.g., medical_supplies, medicines, equipment)',
              },
              low_stock: {
                type: 'boolean',
                description: 'Filter to show only low stock items',
              },
            },
          },
        },
        {
          name: 'get_bed_capacity',
          description: 'Get bed capacity information with occupancy rates',
          inputSchema: {
            type: 'object',
            properties: {
              ward_type: {
                type: 'string',
                description: 'Filter by ward type (e.g., ICU, General, Emergency)',
              },
            },
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
          case 'get_staffing':
            return await this.handleGetStaffing(args);
          case 'get_inventory':
            return await this.handleGetInventory(args);
          case 'get_bed_capacity':
            return await this.handleGetBedCapacity(args);
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

  private async handleGetStaffing(args: unknown): Promise<CallToolResult> {
    const { department, shift } = args as { 
      department?: string; 
      shift?: string; 
    };

    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (shift) params.append('shift', shift);

    const url = params.toString() ? `${API_BASE_URL}/staffing?${params.toString()}` : `${API_BASE_URL}/staffing`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch staffing data');
    }

    const staffing = data.data;
    if (staffing.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '👥 No staffing data found for the specified criteria.',
          },
        ],
        isError: false,
      };
    }

    const staffingText = staffing.map((staff: any) => `
🔹 ${staff.department}
   Role: ${staff.role}
   Shift: ${staff.shift}
   Staff on Duty: ${staff.staff_on_duty}
   Required Staff: ${staff.required_staff}
   Status: ${staff.staff_on_duty >= staff.required_staff ? '✅ Adequate' : '⚠️ Understaffed'}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `👥 Staffing Information (${staffing.length} records):${staffingText}`,
        },
      ],
      isError: false,
    };
  }

  private async handleGetInventory(args: unknown): Promise<CallToolResult> {
    const { category, low_stock } = args as { 
      category?: string; 
      low_stock?: boolean; 
    };

    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (low_stock) params.append('low_stock', 'true');

    const url = params.toString() ? `${API_BASE_URL}/inventory?${params.toString()}` : `${API_BASE_URL}/inventory`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch inventory data');
    }

    const inventory = data.data;
    const lowStockCount = data.low_stock_count;

    if (inventory.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '📦 No inventory items found for the specified criteria.',
          },
        ],
        isError: false,
      };
    }

    const inventoryText = inventory.map((item: any) => `
🔹 ${item.item_name} (${item.category})
   Current Stock: ${item.current_stock} ${item.unit}
   Reorder Level: ${item.reorder_level}
   Status: ${item.status === 'low' ? '⚠️ LOW STOCK' : '✅ Normal'}
   Last Updated: ${new Date(item.last_updated).toLocaleDateString()}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `📦 Inventory Status (${inventory.length} items, ${lowStockCount} low stock):${inventoryText}`,
        },
      ],
      isError: false,
    };
  }

  private async handleGetBedCapacity(args: unknown): Promise<CallToolResult> {
    const { ward_type } = args as { 
      ward_type?: string; 
    };

    const params = new URLSearchParams();
    if (ward_type) params.append('ward_type', ward_type);

    const response = await fetch(`${API_BASE_URL}/capacity?${params.toString()}`);
    const data = await response.json() as any;

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch bed capacity data');
    }

    const capacity = data.data;
    const totalAvailable = data.total_available;

    if (capacity.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: '🛏️ No bed capacity data found for the specified criteria.',
          },
        ],
        isError: false,
      };
    }

    const capacityText = capacity.map((bed: any) => `
🔹 ${bed.ward_type}
   Total Beds: ${bed.total_beds}
   Occupied: ${bed.occupied_beds}
   Available: ${bed.available_beds}
   Occupancy Rate: ${bed.occupancy_rate}%
   Status: ${bed.occupancy_rate >= 90 ? '⚠️ High Occupancy' : bed.occupancy_rate >= 70 ? '⚡ Moderate' : '✅ Available'}`).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `🛏️ Bed Capacity Overview (Total Available: ${totalAvailable}):${capacityText}`,
        },
      ],
      isError: false,
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await (this.server as any).connect(transport);
    console.error('🏥 Hospital Resource Management MCP Server started successfully');
  }
}

// Start the server
const server = new MCPServer();
server.start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});