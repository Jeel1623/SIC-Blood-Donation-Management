from typing import List
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter

from models.donor import Donor
from models.blood_inventory import BloodInventory


def blood_group_distribution_chart(donors: List[Donor]) -> plt.Figure:
    """Bar chart of how many donors per blood group."""
    counts = Counter(d.blood_group for d in donors)
    if not counts:
        fig, ax = plt.subplots()
        ax.text(0.5, 0.5, "No donor data", ha="center", va="center")
        return fig

    groups = sorted(counts.keys())
    values = [counts[g] for g in groups]

    fig, ax = plt.subplots(figsize=(8, 4))
    sns.barplot(x=groups, y=values, palette="Reds_d", ax=ax)
    ax.set_title("Blood Group Distribution Among Donors")
    ax.set_xlabel("Blood Group")
    ax.set_ylabel("Number of Donors")
    fig.tight_layout()
    return fig


def inventory_status_chart(inventory: List[BloodInventory]) -> plt.Figure:
    """Bar chart of available units per blood group; red = expired, green = valid."""
    if not inventory:
        fig, ax = plt.subplots()
        ax.text(0.5, 0.5, "No inventory data", ha="center", va="center")
        return fig

    groups = [item.blood_group for item in inventory]
    units = [item.available_units for item in inventory]
    colors = ["#d62728" if item.is_expired() else "#2ca02c" for item in inventory]

    fig, ax = plt.subplots(figsize=(8, 4))
    ax.bar(groups, units, color=colors)
    ax.set_title("Blood Inventory Status  (Green = Valid | Red = Expired)")
    ax.set_xlabel("Blood Group")
    ax.set_ylabel("Available Units")
    fig.tight_layout()
    return fig


def monthly_donations_chart(monthly_summary: dict) -> plt.Figure:
    """Line chart of total units donated per month."""
    if not monthly_summary:
        fig, ax = plt.subplots()
        ax.text(0.5, 0.5, "No donation history", ha="center", va="center")
        return fig

    months = sorted(monthly_summary.keys())
    values = [monthly_summary[m] for m in months]

    fig, ax = plt.subplots(figsize=(10, 4))
    sns.lineplot(x=months, y=values, marker="o", color="darkred", ax=ax)
    ax.set_title("Monthly Blood Donations")
    ax.set_xlabel("Month")
    ax.set_ylabel("Units Donated")
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha="right")
    fig.tight_layout()
    return fig
