"""
Background cleanup: permanently deletes meal log entries older than 24
hours so the `meals` table doesn't grow forever and each user's log
naturally resets on a rolling 24h basis.

Started from main.py's lifespan and runs for as long as the server is up.
"""

import asyncio
import datetime

from app.database import SessionLocal
from app import models

WINDOW_HOURS = 24
CHECK_INTERVAL_SECONDS = 30 * 60  # run every 30 minutes


def purge_old_meals() -> int:
    """Delete meals older than WINDOW_HOURS. Returns number of rows deleted."""
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=WINDOW_HOURS)
    db = SessionLocal()
    try:
        deleted = db.query(models.Meal).filter(models.Meal.logged_at < cutoff).delete()
        db.commit()
        return deleted
    finally:
        db.close()


async def run_meal_cleanup_loop():
    """Runs forever (until cancelled), purging stale meals periodically."""
    while True:
        try:
            deleted = await asyncio.to_thread(purge_old_meals)
            if deleted:
                print(f"[CaloriX] Cleanup: purged {deleted} meal(s) older than {WINDOW_HOURS}h")
        except Exception as e:
            print(f"[CaloriX] Cleanup error: {e}")
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
