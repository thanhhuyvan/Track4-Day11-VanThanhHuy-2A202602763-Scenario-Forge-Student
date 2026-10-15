"""Part B: physics check. TODO 3."""
from __future__ import annotations

G = 9.81


def is_feasible(p: dict) -> bool:
    """TODO 3. False for scenarios no real road user could produce. Reject if ANY of:

    - the lane change needs more sideways grip than the road has: the cosine lane change of 3.5 m over
      p["cutDur"] seconds peaks at a_lat = (pi / cutDur)^2 * 3.5 / 2; reject if a_lat > mu * g;
    - the post-merge braking p["cutBrake"] exceeds mu * g;
    - the pedestrian runs: p["pedV"] > 2.5 m/s;
    - the cut-in speed p["cutV"] is not in (0, 22] m/s.
    mu is p["mu"]. A search that keeps infeasible scenarios reports failures that cannot happen.
    """
    import math

    duration, mu = float(p["cutDur"]), float(p["mu"])
    brake, ped_v, cut_v = (float(p[key]) for key in ("cutBrake", "pedV", "cutV"))
    if not all(math.isfinite(v) for v in (duration, mu, brake, ped_v, cut_v)):
        return False
    if duration <= 0 or mu <= 0:
        return False
    lateral = (math.pi / duration) ** 2 * 3.5 / 2
    return bool(lateral <= mu * G and brake <= mu * G
                and ped_v <= 2.5 and 0 < cut_v <= 22)
