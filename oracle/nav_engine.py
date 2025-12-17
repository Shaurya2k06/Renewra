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
    
    def simulate_monthly_yield(self) -> None:
        """
        Simulate monthly yield updates with degradation and weather variance.
        
        This modifies project cash flows to simulate real-world conditions:
        - Solar panel degradation (~0.5% per year)
        - Weather variance (±10% monthly)
        - Seasonal adjustments
        
        Note: This modifies the in-memory data, not the JSON file.
        """
        for project in self.projects:
            if project.status != 'operational':
                continue
            
            # Base degradation factor (0.5% annual = 0.042% monthly)
            degradation = 0.99958
            
            # Weather variance: random ±10%
            weather_factor = 1.0 + random.uniform(-0.10, 0.10)
            
            # Apply factors to cash flow
            new_cash_flow = int(
                project.cash_flow_this_month * degradation * weather_factor
            )
            
            project.cash_flow_this_month = max(0, new_cash_flow)
    
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
    
    args = parser.parse_args()
    
    try:
        engine = NavEngine(args.projects)
        nav_cents, timestamp = engine.compute_nav()
        
        print(f"NAV: ${nav_cents / 100:.2f} ({nav_cents} cents)")
        print(f"Timestamp: {timestamp}")
        
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
        exit(1)
