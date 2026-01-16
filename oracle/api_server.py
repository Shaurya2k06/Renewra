"""
Renewra Oracle API Server

Exposes project data and NAV information via REST API.
Runs alongside the oracle service for frontend consumption.
"""

import json
from pathlib import Path
from flask import Flask, jsonify
from flask_cors import CORS
from nav_engine import NavEngine

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Config
PROJECTS_FILE = Path(__file__).parent / "projects.json"

# Initialize NAV engine
try:
    nav_engine = NavEngine(str(PROJECTS_FILE))
except Exception as e:
    print(f"Warning: Could not initialize NAV engine: {e}")
    nav_engine = None


def load_projects_data():
    """Load raw project data from JSON file."""
    with open(PROJECTS_FILE, 'r') as f:
        return json.load(f)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "renewra-oracle-api"
    })


@app.route('/api/projects', methods=['GET'])
def get_projects():
    """
    Get all projects with their current valuation data.
    
    Returns:
        List of project objects with full financial details.
    """
    data = load_projects_data()
    projects = data.get('projects', [])
    
    # Add computed fields
    for project in projects:
        # Calculate monthly revenue for display
        if project.get('type') in ('solar', 'wind'):
            annual_prod = project.get('annual_production_kwh', 0)
            ppa_price = project.get('ppa_price_per_kwh', 0)
            project['annual_revenue'] = int(annual_prod * ppa_price)
        elif project.get('type') == 'storage':
            annual_mwh = project.get('annual_revenue_mwh', 0)
            ppa_price = project.get('ppa_price_per_mwh', 0)
            project['annual_revenue'] = int(annual_mwh * ppa_price)
        
        # Price per unit for display
        if project.get('type') in ('solar', 'wind'):
            project['price_display'] = f"${project.get('ppa_price_per_kwh', 0):.3f}/kWh"
        elif project.get('type') == 'storage':
            project['price_display'] = f"${project.get('ppa_price_per_mwh', 0):.0f}/MWh"
    
    return jsonify({
        "projects": projects,
        "count": len(projects)
    })


@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """
    Get a single project by ID.
    
    Args:
        project_id: The project identifier (e.g., "solar_001")
    """
    data = load_projects_data()
    projects = data.get('projects', [])
    
    project = next((p for p in projects if p.get('id') == project_id), None)
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    return jsonify(project)


@app.route('/api/nav', methods=['GET'])
def get_nav():
    """
    Get current NAV and fund statistics.
    
    Returns computed NAV per token and breakdown of calculation.
    """
    if not nav_engine:
        return jsonify({"error": "NAV engine not initialized"}), 500
    
    try:
        nav_cents, timestamp = nav_engine.compute_nav()
        breakdown = nav_engine.get_nav_breakdown()
        monthly_yield = nav_engine.get_total_monthly_yield()
        
        return jsonify({
            "nav_cents": nav_cents,
            "nav_usd": round(nav_cents / 100, 2),
            "timestamp": timestamp,
            "monthly_yield_usd": monthly_yield,
            "breakdown": breakdown
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/fund', methods=['GET'])
def get_fund_metadata():
    """
    Get fund-level metadata.
    
    Returns cash on hand, debt, token supply, etc.
    """
    data = load_projects_data()
    metadata = data.get('fund_metadata', {})
    
    # Add computed stats
    projects = data.get('projects', [])
    total_capacity_mw = sum(p.get('capacity_mw', 0) for p in projects)
    total_valuation = sum(p.get('dcf_valuation', 0) for p in projects if p.get('status') == 'operational')
    operational_count = len([p for p in projects if p.get('status') == 'operational'])
    
    return jsonify({
        **metadata,
        "total_capacity_mw": total_capacity_mw,
        "total_valuation": total_valuation,
        "operational_projects": operational_count,
        "total_projects": len(projects)
    })


@app.route('/api/prices', methods=['GET'])
def get_prices():
    """
    Get current PPA prices for all projects.
    
    Returns a summary of energy prices across the portfolio.
    """
    data = load_projects_data()
    projects = data.get('projects', [])
    
    prices = []
    for p in projects:
        if p.get('status') != 'operational':
            continue
            
        price_info = {
            "id": p.get('id'),
            "name": p.get('name'),
            "type": p.get('type'),
            "location": p.get('location')
        }
        
        if p.get('type') in ('solar', 'wind'):
            price_info["price_per_kwh"] = p.get('ppa_price_per_kwh', 0)
            price_info["price_display"] = f"${p.get('ppa_price_per_kwh', 0):.3f}/kWh"
        elif p.get('type') == 'storage':
            price_info["price_per_mwh"] = p.get('ppa_price_per_mwh', 0)
            price_info["price_display"] = f"${p.get('ppa_price_per_mwh', 0):.0f}/MWh"
        
        prices.append(price_info)
    
    return jsonify({
        "prices": prices,
        "count": len(prices)
    })


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Renewra Oracle API Server')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=5001, help='Port to listen on')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    print(f"Starting Renewra Oracle API on http://{args.host}:{args.port}")
    print("Endpoints:")
    print("  GET /api/health     - Health check")
    print("  GET /api/projects   - All projects with valuations")
    print("  GET /api/projects/<id> - Single project details")
    print("  GET /api/nav        - Current NAV and breakdown")
    print("  GET /api/fund       - Fund metadata")
    print("  GET /api/prices     - PPA prices summary")
    
    app.run(host=args.host, port=args.port, debug=args.debug)
