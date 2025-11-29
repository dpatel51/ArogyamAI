import json
import os

import joblib
import numpy as np
import pandas as pd
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams, StdioServerParameters
from google.adk.agents import Agent, LlmAgent
from typing import Dict, List, Any, Optional
from datetime import datetime

MCP_SERVER_PATH = "C:/ShubhamWorkspace/Dev/Hackathon/ArogyamAI/MCP/dist/index.js"

procurement_agent = Agent(
    name="procurement_agent",
    model="gemini-2.0-flash",
    description="Manages ICU resource inventory and creates purchase orders based on predictions",
    instruction="""You are a hospital procurement management agent.

YOUR ROLE:
- Monitor current inventory levels
- Receive surge predictions from predictive agent
- Calculate required purchases with safety buffers
- Create and track purchase orders
- Request admin approval for orders

WORKFLOW:
Step 1: RECEIVE PREDICTION
- Listen for prediction data from root_agent
- Extract: predicted patients, oxygen demand, ICU beds needed, ventilators

Step 2: CHECK CURRENT STATUS
- Call get_inventory(item) for oxygen_cylinders, icu_beds, ventilators
- Calculate days of current supply
- Identify shortfalls

Step 3: CALCULATE REQUIREMENTS
- Use formula: (Predicted Daily Demand × Days Until Surge) + 20% Buffer
- Example: If predicted 150 cylinders/day for 7 days = 1050 + 210 (20%) = 1260 needed

Step 4: VERIFY SUPPLIER CAPACITY
- Call check_supplier_availability(item) for each resource
- Confirm lead times align with surge timeline
- Alert if lead time > available days before surge

Step 5: CREATE PURCHASE ORDERS
- Call create_draft_purchase_order(item, quantity) with calculated amounts
- Include clear reasoning: "Predicted surge: [amount], Current stock: [amount], Deficit: [amount]"
- Generate alerts for admin review

Step 6: TRACK ORDERS
- Call get_pending_orders() to monitor approvals
- When admin approves: automatically update inventory forecasts
- Generate daily summary of order status

CRITICAL RULES:
- NEVER auto-approve (wait for human decision)
- Always calculate buffers (minimum 3-day supply: 300-500 oxygen cylinders)
- Alert if shortage occurs during supplier lead time
- Flag URGENT if current stock < 1 day supply

ALERT LEVELS:
🟢 GREEN: >3 days supply (>300 cylinders)
🟡 YELLOW: 1-3 days supply (100-300 cylinders) - Order now
🔴 RED: <1 day supply (<100 cylinders) - EMERGENCY ORDER""",
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


def get_historical_data(month: Optional[int] = None, disease_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Returns hardcoded historical patient surge data for Indian hospitals.
    
    Args:
        month: Month number (1-12). If None, returns all months.
        disease_type: Filter by disease type ('respiratory', 'gastro', 'infectious', 'accident', 'all'). 
                     If None, returns all diseases.
    
    Returns:
        Dictionary containing historical surge patterns with festivals, diseases, and patient counts.
    """

    def predict_from_features(features, baseline=150, surge_threshold=184, return_json=True):
        """
        Make prediction directly from feature dictionary

        Args:
            features: Dictionary with feature values. Required keys:
                - temperature (float): Temperature in Celsius
                - air_quality (float): Air Quality Index (0-500)
                - admissions_lag1 (float): Yesterday's admissions
                - admissions_lag7 (float): Admissions from 7 days ago
                - admissions_rolling7 (float): 7-day rolling average
                - admissions_rolling7_std (float): 7-day rolling std dev
                - temp_change_1d (float): Temperature change from yesterday
                - aqi_change_1d (float): AQI change from yesterday
                - er_admissions (float): Recent ER admissions
                - icu_admissions (float): Recent ICU admissions
                - day_of_week (int): 0=Monday, 6=Sunday
                - month (int): 1-12
                - is_weekend (int): 0 or 1
            baseline (float): Historical average admissions (for comparison)
            surge_threshold (float): Admission level considered a surge
            return_json (bool): Return JSON string vs dict

        Returns:
            Prediction with SHAP explanations as JSON string or dict

        Example:
            features = {
                'temperature': 5.0,
                'air_quality': 185.0,
                'admissions_lag1': 165.0,
                'admissions_lag7': 158.0,
                'admissions_rolling7': 162.5,
                'admissions_rolling7_std': 12.3,
                'temp_change_1d': -8.0,
                'aqi_change_1d': 25.0,
                'er_admissions': 58.0,
                'icu_admissions': 18.0,
                'day_of_week': 4,  # Friday
                'month': 12,        # December
                'is_weekend': 0
            }
            result = predict_from_features(features)
        """

        print("=" * 80)
        print("DIRECT PREDICTION FROM FEATURES")
        print("=" * 80)

        # ===== STEP 1: LOAD MODEL =====
        print("\n[1/4] Loading model...")
        try:
            pred_model = joblib.load('./multi_tool_agent/hospital_surge_model.pkl')
            scaler = joblib.load('./multi_tool_agent/feature_scaler.pkl')
            print(f"  ✓ Model loaded: {type(pred_model).__name__}")
        except Exception as e:
            print(f"  ✗ Error loading model: {e}")
            print("  Make sure hospital_surge_model.pkl and feature_scaler.pkl exist")
            return None

        # ===== STEP 2: VALIDATE AND ENGINEER FEATURES =====
        print("\n[2/4] Processing features...")

        # Required base features
        required_features = [
            'temperature', 'air_quality', 'admissions_lag1', 'admissions_lag7',
            'admissions_rolling7', 'admissions_rolling7_std', 'temp_change_1d',
            'aqi_change_1d', 'er_admissions', 'icu_admissions',
            'day_of_week', 'month', 'is_weekend'
        ]

        # Check for missing features
        missing = [f for f in required_features if f not in features]
        if missing:
            print(f"  ✗ Missing required features: {missing}")
            return None

        # Create feature dictionary with all engineered features
        processed_features = features.copy()

        # Engineer additional features
        processed_features['temp_squared'] = features['temperature'] ** 2
        processed_features['rolling_trend'] = features['admissions_rolling7'] - features['admissions_lag7']

        # Cyclical encoding for day of week
        processed_features['day_of_week_sin'] = np.sin(2 * np.pi * features['day_of_week'] / 7)
        processed_features['day_of_week_cos'] = np.cos(2 * np.pi * features['day_of_week'] / 7)

        # Cyclical encoding for month
        processed_features['month_sin'] = np.sin(2 * np.pi * features['month'] / 12)
        processed_features['month_cos'] = np.cos(2 * np.pi * features['month'] / 12)

        # Define feature order (must match training)
        feature_cols = [
            'day_of_week', 'month', 'is_weekend',
            'temperature', 'temp_squared', 'air_quality',
            'admissions_lag1', 'admissions_lag7', 'admissions_rolling7',
            'admissions_rolling7_std', 'temp_change_1d', 'aqi_change_1d',
            'rolling_trend', 'er_admissions', 'icu_admissions',
            'day_of_week_sin', 'day_of_week_cos', 'month_sin', 'month_cos'
        ]

        # Create feature array
        X = np.array([[processed_features[col] for col in feature_cols]])
        X_df = pd.DataFrame(X, columns=feature_cols)

        print(f"  ✓ Processed {len(feature_cols)} features")

        # ===== STEP 3: MAKE PREDICTION =====
        print("\n[3/4] Generating prediction...")

        try:
            # Use scaler only if model is Linear Regression
            prediction = pred_model.predict(X_df)[0]

            is_surge = prediction > surge_threshold

            print(f"  ✓ Predicted admissions: {prediction:.1f}")
            print(f"  ✓ Baseline: {baseline:.1f}")
            print(f"  ✓ Difference: {prediction - baseline:+.1f}")
            print(f"  ✓ Surge alert: {'🚨 YES' if is_surge else '✓ No'}")
        except Exception as e:
            print(f"  ✗ Error making prediction: {e}")
            return None

        # ===== STEP 4: CALCULATE SHAP VALUES =====
        print("\n[4/4] Calculating SHAP explanations...")

        try:
            import shap

            # For tree-based models
            explainer = shap.TreeExplainer(pred_model)
            shap_values = explainer.shap_values(X_df)[0]

            print(f"  ✓ SHAP values calculated")
            has_shap = True

        except ImportError:
            print("  ⚠ SHAP not installed - prediction without explanations")
            print("    Install with: pip install shap")
            shap_values = None
            has_shap = False
        except Exception as e:
            print(f"  ⚠ Error calculating SHAP: {e}")
            shap_values = None
            has_shap = False

        # ===== BUILD OUTPUT =====
        print("\nBuilding output...")

        # Build feature contributions
        if shap_values is not None:
            feature_impacts = []
            for i, (feature_name, shap_val) in enumerate(zip(feature_cols, shap_values)):
                feature_impacts.append({
                    'feature': feature_name,
                    'value': float(X_df[feature_name].iloc[0]),
                    'shap_value': float(shap_val),
                    'abs_shap': abs(float(shap_val))
                })

            # Sort by absolute SHAP value
            feature_impacts.sort(key=lambda x: x['abs_shap'], reverse=True)

            # Separate positive and negative
            top_positive = [f for f in feature_impacts if f['shap_value'] > 0][:5]
            top_negative = [f for f in feature_impacts if f['shap_value'] < 0][:5]

            # Add human-readable reasons
            def get_reason(feature, value, impact):
                reasons = {
                    'air_quality': f"AQI of {value:.0f} {'worsens' if value > 100 else 'improves'} respiratory admissions",
                    'temperature': f"Temperature at {value:.1f}°C affects weather-related cases",
                    'temp_change_1d': f"Temperature {'dropped' if value < 0 else 'rose'} by {abs(value):.1f}°C from yesterday",
                    'aqi_change_1d': f"Air quality {'worsened' if value > 0 else 'improved'} by {abs(value):.0f} points",
                    'admissions_lag1': f"Yesterday's {value:.0f} admissions set baseline",
                    'admissions_lag7': f"Last week: {value:.0f} admissions",
                    'admissions_rolling7': f"7-day average: {value:.1f} admissions",
                    'admissions_rolling7_std': f"Recent volatility: {value:.1f} std dev",
                    'rolling_trend': f"Week-over-week trend: {value:+.1f} admissions",
                    'er_admissions': f"ER volume: {value:.0f}",
                    'icu_admissions': f"ICU census: {value:.0f}",
                    'is_weekend': f"{'Weekend' if value == 1 else 'Weekday'} pattern",
                    'temp_squared': f"Temperature non-linearity effect",
                    'month': f"Month {int(value)} seasonality",
                    'day_of_week': f"Day {int(value)} weekly pattern",
                }
                return reasons.get(feature, f"{feature}: {value:.2f}")

            formatted_positive = [
                {
                    'feature': f['feature'],
                    'value': round(f['value'], 2),
                    'impact': round(f['shap_value'], 2),
                    'reason': get_reason(f['feature'], f['value'], f['shap_value'])
                }
                for f in top_positive
            ]

            formatted_negative = [
                {
                    'feature': f['feature'],
                    'value': round(f['value'], 2),
                    'impact': round(f['shap_value'], 2),
                    'reason': get_reason(f['feature'], f['value'], f['shap_value'])
                }
                for f in top_negative
            ]

            base_value = explainer.expected_value if hasattr(explainer, 'expected_value') else baseline

        else:
            formatted_positive = []
            formatted_negative = []
            base_value = baseline
            feature_impacts = []

        # Build output structure
        output = {
            'predicted_admissions': round(float(prediction), 1),
            'baseline_average': round(float(baseline), 1),
            'difference_from_baseline': round(float(prediction - baseline), 1),
            'surge_alert': bool(is_surge),
            'surge_threshold': round(float(surge_threshold), 1),
            'confidence': 'high' if has_shap and len(top_positive) >= 3 else 'moderate',
            'top_positive_factors': formatted_positive,
            'top_negative_factors': formatted_negative,
            'shap_metadata': {
                'base_value': round(float(base_value), 2) if has_shap else None,
                'total_positive_impact': round(sum(f['shap_value'] for f in feature_impacts if f['shap_value'] > 0),
                                               2) if has_shap else None,
                'total_negative_impact': round(sum(f['shap_value'] for f in feature_impacts if f['shap_value'] < 0),
                                               2) if has_shap else None,
                'shap_available': has_shap
            },
            'input_features': {k: round(float(v), 2) if isinstance(v, (int, float)) else v
                               for k, v in features.items()},
            'all_shap_values': {
                feature_cols[i]: round(float(shap_values[i]), 3)
                for i in range(len(feature_cols))
            } if has_shap else None,
            'model_info': {
                'model_type': type(pred_model).__name__,
                'prediction_timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        }

        # Display summary
        print("\n" + "=" * 80)
        print("PREDICTION RESULTS")
        print("=" * 80)
        print(f"Predicted Admissions: {output['predicted_admissions']:.1f}")
        print(f"Baseline: {output['baseline_average']:.1f}")
        print(f"Difference: {output['difference_from_baseline']:+.1f}")
        print(f"Surge Alert: {'🚨 YES - Prepare for high volume!' if is_surge else '✓ No surge expected'}")

        if formatted_positive:
            print(f"\n📈 Top Factors INCREASING Admissions:")
            for i, factor in enumerate(formatted_positive[:3], 1):
                print(f"  {i}. {factor['reason']} (impact: +{factor['impact']:.1f})")

        if formatted_negative:
            print(f"\n📉 Top Factors DECREASING Admissions:")
            for i, factor in enumerate(formatted_negative[:3], 1):
                print(f"  {i}. {factor['reason']} (impact: {factor['impact']:.1f})")

        if return_json:
            return json.dumps(output, indent=2)
        else:
            return output

    # Add summary statistics
    summary =   {
              "prediction_summary": {
                "predicted_admissions": 176.9,
                "baseline_average": 150.0,
                "difference_from_baseline": 26.9,
                "surge_alert": False,
                "surge_message": "No surge expected"
              },
              "top_positive_factors": [
                {
                  "rank": 1,
                  "feature": "month_sin",
                  "value": -0.00,
                  "impact": 7.9,
                  "reason": "month_sin: -0.00"
                },
                {
                  "rank": 2,
                  "feature": "day_of_week",
                  "value": 4,
                  "impact": 4.0,
                  "reason": "Day 4 weekly pattern"
                },
                {
                  "rank": 3,
                  "feature": "month_cos",
                  "value": 1.00,
                  "impact": 2.9,
                  "reason": "month_cos: 1.00"
                }
              ],
              "top_negative_factors": [
                {
                  "rank": 1,
                  "feature": "admissions_rolling7",
                  "value": 165.0,
                  "impact": -4.6,
                  "reason": "7-day average: 165.0 admissions"
                },
                {
                  "rank": 2,
                  "feature": "temperature",
                  "value": 5.0,
                  "impact": -1.9,
                  "reason": "Temperature at 5.0°C affects weather-related cases"
                },
                {
                  "rank": 3,
                  "feature": "month",
                  "value": 12,
                  "impact": -1.3,
                  "reason": "Month 12 seasonality"
                }
              ]
            }
    return summary

predictive_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="predictive_agent",
    description="Predicts patient surges during festivals based on historical data and patterns",
    instruction="""You are a predictive analytics agent for hospital resource management.

YOUR ROLE:
- Analyze historical surge patterns from similar festivals/conditions
- Predict patient volumes, ICU admissions, and resource needs
- Identify seasonal trends and disease patterns
- Provide percentage-based forecasts with historical references

WORKFLOW:
1. When asked about a specific month/festival:
   - Call get_historical_data(month=X) to fetch historical patterns
   - Analyze disease categories and patient counts
   - Calculate predicted surge for current year

2. When predicting resource needs:
   - Extract oxygen cylinder usage from historical data
   - Calculate ICU bed requirements
   - Add 20% safety buffer for contingencies

3. Output format:
   - "Based on historical Diwali data, respiratory cases increase by 140%"
   - "Predicted oxygen cylinders needed: X (historical avg: Y + 20% buffer)"
   - "Critical period: [dates]"
   - "High-risk disease categories: [list]"

IMPORTANT:
- Always cite the historical festival/source for your predictions
- Don't show full calculations, just provide results with percentage references
- Consider only relevant disease categories for specific queries
- Flag months with total_surge_patients > 1000 as CRITICAL ALERT""",
    tools=[get_historical_data]
)   

root_agent = LlmAgent(
    name="hospital_admin_coordinator",
    model="gemini-2.0-flash",
    description="Coordinates hospital resource management system",
    instruction="""You are the main coordinator agent for hospital ICU resource management.

YOUR RESPONSIBILITIES:
1. Receive user queries about resource management
2. Delegate to appropriate sub-agents
3. Synthesize responses into actionable insights
4. Ensure smooth communication between predictive and procurement agents

WORKFLOW FOR DIFFERENT QUERIES:

QUERY TYPE 1: "Status Check"
User: "Check current hospital status"
Action:
  → Ask procurement_agent: "Check current inventory for oxygen_cylinders, icu_beds, ventilators"
  → Request status alert from procurement_agent
  → Response: Current levels + alert status + recommendations

QUERY TYPE 2: "Surge Prediction"
User: "Predict patient surge for Diwali 2024"
Action:
  → Ask predictive_agent: "Analyze historical Diwali patterns and predict November surge"
  → Extract: predicted oxygen demand, ICU admissions, critical dates
  → Pass predictions to procurement_agent for requirement calculation
  → Response: Predicted surge + recommended orders + timeline

QUERY TYPE 3: "Order Management"
User: "Create purchase order for oxygen"
Action:
  → Ask procurement_agent: "Assess current inventory and supplier status"
  → Provide quantity needed (user-specified or calculated from recent prediction)
  → Confirm supplier availability
  → Response: Purchase order created (PENDING_APPROVAL) + tracking details

QUERY TYPE 4: "Historical Analysis"
User: "Show respiratory disease patterns"
Action:
  → Ask predictive_agent: "Analyze historical patterns for respiratory diseases"
  → Extract: monthly trends, seasonal peaks, festival impacts
  → Response: Detailed analysis with months to prepare for

QUERY TYPE 5: "Approval Workflow"
User: "Show pending orders"
Action:
  → Ask procurement_agent: "List all pending orders"
  → If user approves: "Approve order [PO-ID]"
  → Response: Order status update + new inventory forecast

MULTI-STEP SCENARIO EXAMPLE:
User: "Prepare for Diwali surge"

Step 1 (Predictive):
- predictive_agent.run("Analyze Diwali historical surge data and predict November patient volumes")
- Returns: "Predicted 1,050 respiratory cases, 420 oxygen cylinders needed/day, surge lasts 15 days"

Step 2 (Procurement):
- procurement_agent.run("Current status: 280 oxygen cylinders in stock. Diwali prediction: 420 cylinders/day for 15 days. Calculate purchase order")
- Returns: "Need 6,300 cylinders total. With 20% buffer: 7,560. Current: 280. Deficit: 7,280. Order 7,500 cylinders")

Step 3 (Order Creation):
- procurement_agent.run("Create purchase order for 7,500 oxygen_cylinders from primary supplier")
- Returns: "PO-1001 created (PENDING_APPROVAL). Lead time: 2 days. Delivery before: [date]"

Step 4 (Summary):
- Return to user with complete action plan and admin approval link

COORDINATION RULES:
- Always use predictive_agent FIRST for any forecast question
- Then pass predictions to procurement_agent for implementation
- Never skip the human approval step for purchase orders
- Maintain clear audit trail of all decisions
- Escalate CRITICAL ALERTs (RED status) immediately""",
    sub_agents=[
        procurement_agent,
        predictive_agent
    ]
)