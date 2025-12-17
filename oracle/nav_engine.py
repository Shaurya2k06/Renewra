"""
Renewra Oracle Engine - NAV Calculation

Computes fund NAV from project cash flows and fund metadata.
Runs on schedule (hourly on devnet) and submits NAV to on-chain oracle.
"""

import json
import time
import random
from pathlib import Path
from dataclasses import dataclass
from typing import Tuple, List, Dict, Any


@dataclass
class Project:
    """Represents a renewable energy project in the fund."""
    id: str
    dcf_valuation: int  # DCF valuation in USD
    cash_flow_this_month: int  # Monthly cash flow in USD
    status: str  # 'operational', 'construction', 'decommissioned'


@dataclass
class FundMetadata:
    """Fund-level financial metadata."""
    total_cash_on_hand_usdc: int  # Cash reserves in USDC
    total_debt: int  # Outstanding debt in USD
    pending_capex: int  # Pending capital expenditures
    token_supply: int  # Total REI tokens in circulation


class NavEngine:
    """
    NAV Engine for Renewra Fund.
    
    Computes Net Asset Value per token from:
    - Sum of operational project DCF valuations
    - Fund cash on hand
    - Outstanding debt
    - Pending capital expenditures
    - Total token supply
    
    Formula: NAV = (Σ project_dcf + cash - debt - capex) / token_supply
    """
    
    def __init__(self, projects_file: str):
        """
        Initialize the NAV engine with project data.
        
        Args:
            projects_file: Path to JSON file containing projects and fund metadata
        """
        self.projects_file = Path(projects_file)
        self.data: Dict[str, Any] = {}
        self.projects: List[Project] = []
        self.fund_metadata: FundMetadata = None
        
        self._load_data()
    
    def _load_data(self) -> None:
        """Load and parse the projects JSON file."""
        if not self.projects_file.exists():
            raise FileNotFoundError(f"Projects file not found: {self.projects_file}")
        
        with open(self.projects_file, 'r') as f:
            self.data = json.load(f)
        
        # Parse projects
        self.projects = [
            Project(
                id=p['id'],
                dcf_valuation=int(p['dcf_valuation']),
                cash_flow_this_month=int(p['cash_flow_this_month']),
                status=p['status']
            )
            for p in self.data.get('projects', [])
        ]
        
        # Parse fund metadata
        meta = self.data.get('fund_metadata', {})
        self.fund_metadata = FundMetadata(
            total_cash_on_hand_usdc=int(meta.get('total_cash_on_hand_usdc', 0)),
            total_debt=int(meta.get('total_debt', 0)),
            pending_capex=int(meta.get('pending_capex', 0)),
            token_supply=int(meta.get('token_supply', 1))  # Avoid division by zero
        )
    
    def reload_data(self) -> None:
        """Reload project data from file (for hot-reloading)."""
        self._load_data()
    
    def compute_nav(self) -> Tuple[int, int]:
        """
        Compute the current NAV per token.
        
        Formula: NAV = (Σ project_dcf + cash - debt - capex) / token_supply
        
        Returns:
            Tuple of (nav_in_cents: int, timestamp: int)
            - nav_in_cents: NAV per token in cents (e.g., 4760 = $47.60)
            - timestamp: Unix timestamp in seconds
        """
        # Step 1-2: Sum all DCF valuations from operational projects only
        sum_valuations = sum(
            p.dcf_valuation 
            for p in self.projects 
            if p.status == 'operational'
        )
        
        # Step 3: Get fund metadata values
        cash = self.fund_metadata.total_cash_on_hand_usdc
        debt = self.fund_metadata.total_debt
        capex = self.fund_metadata.pending_capex
        supply = self.fund_metadata.token_supply
        
        # Step 4: Calculate net asset value
        # NAV = (project_valuations + cash - debt - capex)
        net_asset_value = sum_valuations + cash - debt - capex
        
        # Step 5: Calculate NAV per token (in dollars)
        # Ensure we don't divide by zero
        if supply <= 0:
            raise ValueError("Token supply must be positive")
        
        nav_per_token = net_asset_value / supply
        
        # Step 6: Convert to cents using round() for proper rounding
        # Use round() instead of int() to avoid truncation errors
        nav_in_cents = int(round(nav_per_token * 100))
        
        # Ensure NAV is positive (sanity check)
        if nav_in_cents <= 0:
            raise ValueError(f"Calculated NAV is non-positive: {nav_in_cents}")
        
        # Step 7: Return NAV and current Unix timestamp
        timestamp = int(time.time())
        
        return (nav_in_cents, timestamp)
    
    def simulate_monthly_yield(self) -> Dict[str, Any]:
        """
        Simulate monthly yield updates with degradation and weather variance.
        
        This modifies project cash flows to simulate real-world conditions:
        - Weather variance: ±5% production variance
        - Equipment degradation: efficiency loss over time
        - Cash flow calculation based on PPA, OpEx, and taxes
        
        Formula for each project:
        1. adjusted_production = annual_prod * variance * (1 - degradation_rate)
        2. monthly_prod = adjusted_production / 12
        3. monthly_revenue = monthly_prod * ppa_price
        4. monthly_opex = (opex_annual + insurance_annual) / 12
        5. net_cf = (monthly_revenue - monthly_opex) * (1 - tax_rate)
        
        Note: This modifies the in-memory data, not the JSON file.
        
        Returns:
            Dict with simulation summary (before/after values)
        """
        simulation_results = []
        
        for project_data in self.data.get('projects', []):
            if project_data.get('status') != 'operational':
                continue
            
            project_id = project_data['id']
            project_type = project_data.get('type', 'solar')
            old_cash_flow = project_data.get('cash_flow_this_month', 0)
            
            # Get degradation rate (default: 0.5% for solar, 0.8% for wind, 2% for storage)
            degradation_rate = project_data.get('degradation_rate', 0.005)
            
            # Get tax rate (default: 21%)
            tax_rate = project_data.get('tax_rate', 0.21)
            
            # Step 1: Apply weather variance (-5% to +5%)
            weather_variance = random.uniform(0.95, 1.05)
            
            if project_type in ('solar', 'wind'):
                # Solar/Wind: Use kWh production
                annual_production = project_data.get('annual_production_kwh', 0)
                ppa_price = project_data.get('ppa_price_per_kwh', 0.06)
                
                # Step 1: Calculate adjusted production
                # adjusted_production = annual_prod * variance * (1 - degradation)
                adjusted_production = annual_production * weather_variance * (1 - degradation_rate)
                
                # Update current year production
                project_data['current_year_production_kwh'] = int(adjusted_production)
                
                # Step 2: Monthly production
                monthly_production = adjusted_production / 12
                
                # Step 3: Monthly revenue
                monthly_revenue = monthly_production * ppa_price
                
            elif project_type == 'storage':
                # Storage: Use MWh cycles
                capacity_mwh = project_data.get('capacity_mwh', 0)
                annual_cycles = project_data.get('annual_cycles', 365)
                ppa_price = project_data.get('ppa_price_per_mwh', 85)
                
                # Adjusted annual revenue (storage degrades faster)
                adjusted_cycles = annual_cycles * weather_variance * (1 - degradation_rate)
                annual_revenue_mwh = capacity_mwh * adjusted_cycles
                
                project_data['annual_revenue_mwh'] = int(annual_revenue_mwh)
                
                # Monthly revenue
                monthly_revenue = (annual_revenue_mwh * ppa_price) / 12
                
            else:
                # Unknown type, skip
                continue
            
            # Step 4: Monthly operating expenses
            opex_annual = project_data.get('operating_expenses_annual', 0)
            insurance_annual = project_data.get('insurance_annual', 0)
            monthly_opex = (opex_annual + insurance_annual) / 12
            
            # Step 5: Gross profit
            gross_profit = monthly_revenue - monthly_opex
            
            # Step 6: Net cash flow after tax
            net_cash_flow = gross_profit * (1 - tax_rate)
            
            # Ensure non-negative (floor at 0)
            net_cash_flow = max(0, int(net_cash_flow))
            
            # Update project cash flow
            project_data['cash_flow_this_month'] = net_cash_flow
            
            # Also update the Project dataclass if it exists
            for p in self.projects:
                if p.id == project_id:
                    p.cash_flow_this_month = net_cash_flow
                    break
            
            simulation_results.append({
                'id': project_id,
                'type': project_type,
                'old_cash_flow': old_cash_flow,
                'new_cash_flow': net_cash_flow,
                'weather_variance': round(weather_variance, 4),
                'degradation_rate': degradation_rate,
                'monthly_revenue': int(monthly_revenue),
                'monthly_opex': int(monthly_opex)
            })
        
        return {
            'timestamp': int(time.time()),
            'projects_simulated': len(simulation_results),
            'results': simulation_results
        }
    
    def get_total_monthly_yield(self) -> int:
        """
        Get total monthly cash flow from all operational projects.
        
        Returns:
            Total monthly yield in USD
        """
        return sum(
            p.cash_flow_this_month 
            for p in self.projects 
            if p.status == 'operational'
        )
    
    def get_nav_breakdown(self) -> Dict[str, Any]:
        """
        Get detailed breakdown of NAV calculation for debugging/display.
        
        Returns:
            Dictionary with all calculation components
        """
        sum_valuations = sum(
            p.dcf_valuation 
            for p in self.projects 
            if p.status == 'operational'
        )
        
        cash = self.fund_metadata.total_cash_on_hand_usdc
        debt = self.fund_metadata.total_debt
        capex = self.fund_metadata.pending_capex
        supply = self.fund_metadata.token_supply
        
        net_asset_value = sum_valuations + cash - debt - capex
        nav_per_token = net_asset_value / supply if supply > 0 else 0
        nav_in_cents = int(round(nav_per_token * 100))
        
        return {
            'sum_project_valuations': sum_valuations,
            'cash_on_hand': cash,
            'total_debt': debt,
            'pending_capex': capex,
            'net_asset_value': net_asset_value,
            'token_supply': supply,
            'nav_per_token_usd': round(nav_per_token, 2),
            'nav_in_cents': nav_in_cents,
            'operational_projects': len([p for p in self.projects if p.status == 'operational']),
            'total_projects': len(self.projects)
        }


# CLI entry point for testing
if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Renewra NAV Engine')
    parser.add_argument(
        '--projects', 
        default='oracle/projects.json',
        help='Path to projects JSON file'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed NAV breakdown'
    )
    parser.add_argument(
        '--simulate', '-s',
        type=int,
        default=0,
        metavar='MONTHS',
        help='Run monthly simulation for N months before computing NAV'
    )
    parser.add_argument(
        '--seed',
        type=int,
        default=None,
        help='Random seed for reproducible simulations'
    )
    
    args = parser.parse_args()
    
    # Set random seed if provided
    if args.seed is not None:
        random.seed(args.seed)
        print(f"Using random seed: {args.seed}")
    
    try:
        engine = NavEngine(args.projects)
        
        # Run simulation if requested
        if args.simulate > 0:
            print(f"\n--- Running {args.simulate} Month Simulation ---")
            for month in range(1, args.simulate + 1):
                result = engine.simulate_monthly_yield()
                total_yield = engine.get_total_monthly_yield()
                print(f"Month {month}: Total yield = ${total_yield:,}")
                
                if args.verbose:
                    for proj in result['results']:
                        print(f"  {proj['id']}: ${proj['old_cash_flow']:,} -> ${proj['new_cash_flow']:,} "
                              f"(weather: {proj['weather_variance']:.2%})")
            print()
        
        nav_cents, timestamp = engine.compute_nav()
        
        print(f"NAV: ${nav_cents / 100:.2f} ({nav_cents} cents)")
        print(f"Timestamp: {timestamp}")
        print(f"Total Monthly Yield: ${engine.get_total_monthly_yield():,}")
        
        if args.verbose:
            breakdown = engine.get_nav_breakdown()
            print("\n--- NAV Breakdown ---")
            print(f"Project Valuations: ${breakdown['sum_project_valuations']:,}")
            print(f"Cash on Hand: ${breakdown['cash_on_hand']:,}")
            print(f"Total Debt: ${breakdown['total_debt']:,}")
            print(f"Pending CapEx: ${breakdown['pending_capex']:,}")
            print(f"Net Asset Value: ${breakdown['net_asset_value']:,}")
            print(f"Token Supply: {breakdown['token_supply']:,}")
            print(f"Operational Projects: {breakdown['operational_projects']}/{breakdown['total_projects']}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
