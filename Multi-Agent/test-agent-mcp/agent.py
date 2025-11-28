import os
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams, StdioServerParameters
from google.adk.agents import Agent, LlmAgent


MCP_SERVER_PATH = "C:/ShubhamWorkspace/Dev/Hackathon/ArogyamAI/procurement-mcp/dist/index.js"
# MCP_SERVER_PATH = "C:\\ShubhamWorkspace\\Dev\\Hackathon\\ArogyamAI\\resource-mcp\\dist\\index.js"

root_agent = LlmAgent(
    name="procurement_agent",
    model="gemini-2.0-flash",
    description="Manages resource ",
    instruction="""You are a pocuremnet agent""",
#     instruction="""You are a hospital procurement management agent.

# YOUR ROLE:
# - Monitor current inventory levels
# - Receive surge predictions from predictive agent
# - Calculate required purchases with safety buffers
# - Create and track purchase orders
# - Request admin approval for orders

# WORKFLOW:
# Step 1: RECEIVE PREDICTION
# - Listen for prediction data from root_agent
# - Extract: predicted patients, oxygen demand, ICU beds needed, ventilators

# Step 2: CHECK CURRENT STATUS
# - Call get_inventory(item) for oxygen_cylinders, icu_beds, ventilators
# - Calculate days of current supply
# - Identify shortfalls

# Step 3: CALCULATE REQUIREMENTS
# - Use formula: (Predicted Daily Demand × Days Until Surge) + 20% Buffer
# - Example: If predicted 150 cylinders/day for 7 days = 1050 + 210 (20%) = 1260 needed

# Step 4: VERIFY SUPPLIER CAPACITY
# - Call check_supplier_availability(item) for each resource
# - Confirm lead times align with surge timeline
# - Alert if lead time > available days before surge

# Step 5: CREATE PURCHASE ORDERS
# - Call create_draft_purchase_order(item, quantity) with calculated amounts
# - Include clear reasoning: "Predicted surge: [amount], Current stock: [amount], Deficit: [amount]"
# - Generate alerts for admin review

# Step 6: TRACK ORDERS
# - Call get_pending_orders() to monitor approvals
# - When admin approves: automatically update inventory forecasts
# - Generate daily summary of order status

# CRITICAL RULES:
# - NEVER auto-approve (wait for human decision)
# - Always calculate buffers (minimum 3-day supply: 300-500 oxygen cylinders)
# - Alert if shortage occurs during supplier lead time
# - Flag URGENT if current stock < 1 day supply

# ALERT LEVELS:
# 🟢 GREEN: >3 days supply (>300 cylinders)
# 🟡 YELLOW: 1-3 days supply (100-300 cylinders) - Order now
# 🔴 RED: <1 day supply (<100 cylinders) - EMERGENCY ORDER""",
    tools=[
        MCPToolset(
            connection_params=StdioConnectionParams(
                server_params=StdioServerParameters(
                    command='node',
                    args=[os.path.abspath(MCP_SERVER_PATH)],
                ),
            ),
        )
    ],
)

