from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Union, List
from recommendation_engine import NYCRecommendationEngine
import os
import sqlite3
import json
from datetime import datetime, timedelta

app = FastAPI(title="NYC Places Recommendation API", version="1.0.0")

# Initialize recommendation engine
print("Initializing recommendation engine...")
engine = NYCRecommendationEngine()
print("Engine ready!")


# ─────────────────────────────────────────────────────────────────────────────
# Analytics database setup
# ─────────────────────────────────────────────────────────────────────────────

ANALYTICS_DB = "analytics.db"

def get_analytics_db():
    conn = sqlite3.connect(ANALYTICS_DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_analytics_db():
    conn = get_analytics_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT,
            timestamp   TEXT,
            type        TEXT,
            payload     TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            rating      INTEGER,
            comment     TEXT,
            screen      TEXT,
            timestamp   TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        )
    """)
    c.execute("CREATE INDEX IF NOT EXISTS idx_events_type      ON events(type)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_events_session   ON events(session_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)")
    conn.commit()
    conn.close()
    print("Analytics DB ready!")

init_analytics_db()


# ─────────────────────────────────────────────────────────────────────────────
# Request models
# ─────────────────────────────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    preferred_neighborhood: Optional[str] = None
    activities:             Optional[str] = None
    dining_preferences:     Optional[str] = None
    atmosphere:             Optional[str] = None
    music_genres:           Optional[str] = None
    activity_type:          Optional[str] = None
    drinks:                 Optional[bool] = False
    price_tier:             Optional[Union[str, list]] = None
    max_price_tier:         Optional[str] = None
    category:               Optional[Union[str, list]] = None
    top_n:                  Optional[int] = 10

class AnalyticsEvent(BaseModel):
    session_id: str
    timestamp:  str
    type:       str
    payload:    dict = {}

class EventBatch(BaseModel):
    events: List[AnalyticsEvent]

class FeedbackPayload(BaseModel):
    rating:    int
    comment:   Optional[str] = ""
    screen:    Optional[str] = "General"
    timestamp: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Recommendations API
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "online", "message": "NYC Places Recommendation API", "version": "1.0.0"}


@app.post("/api/recommendations")
def get_recommendations(request: RecommendationRequest):
    try:
        data  = request.model_dump()
        top_n = data.pop("top_n", 10)
        recommendations = engine.get_recommendations(data, top_n=top_n)
        result = recommendations.to_dict("records")
        return {"success": True, "count": len(result), "recommendations": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/{user_id}/recommendations")
def get_user_recommendations(user_id: str, top_n: int = 10):
    try:
        user_data = engine.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        recommendations = engine.get_recommendations(user_data, top_n=top_n)
        result = recommendations.to_dict("records")
        return {"success": True, "user": user_data["name"], "count": len(result), "recommendations": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/places")
def get_all_places():
    try:
        places = engine.places_df[[
            "Place_ID", "Name_of_place", "Type", "Category",
            "Neighborhood", "Vibe_Type", "Price_Level"
        ]].to_dict("records")
        return {"success": True, "count": len(places), "places": places}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/places/{place_id}")
def get_place_details(place_id: int):
    try:
        place = engine.places_df[engine.places_df["Place_ID"] == place_id]
        if place.empty:
            raise HTTPException(status_code=404, detail="Place not found")
        result = place.to_dict("records")[0]
        return {"success": True, "place": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Analytics API
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/analytics/event")
def ingest_events(batch: EventBatch):
    """Receive batched analytics events from the frontend."""
    try:
        conn = get_analytics_db()
        c    = conn.cursor()
        for event in batch.events:
            c.execute(
                "INSERT INTO events (session_id, timestamp, type, payload) VALUES (?,?,?,?)",
                (event.session_id, event.timestamp, event.type, json.dumps(event.payload))
            )
        conn.commit()
        conn.close()
        return {"success": True, "ingested": len(batch.events)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analytics/feedback")
def submit_feedback(payload: FeedbackPayload):
    """Store a single feedback submission."""
    try:
        conn = get_analytics_db()
        conn.execute(
            "INSERT INTO feedback (rating, comment, screen, timestamp) VALUES (?,?,?,?)",
            (payload.rating, payload.comment, payload.screen,
             payload.timestamp or datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/dashboard")
def get_dashboard(days: int = 7):
    """Summary metrics for the last N days."""
    try:
        conn  = get_analytics_db()
        c     = conn.cursor()
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()

        sessions = c.execute(
            "SELECT COUNT(DISTINCT session_id) as cnt FROM events WHERE type='session.start' AND timestamp > ?",
            (since,)
        ).fetchone()["cnt"]

        load_rows  = c.execute(
            "SELECT payload FROM events WHERE type='performance.page_load' AND timestamp > ?", (since,)
        ).fetchall()
        load_times = [json.loads(r["payload"]).get("load_complete_ms") for r in load_rows]
        load_times = [t for t in load_times if t is not None]
        avg_load   = round(sum(load_times) / len(load_times)) if load_times else None

        api_rows = c.execute(
            "SELECT payload FROM events WHERE type='performance.api_call' AND timestamp > ?", (since,)
        ).fetchall()
        api_by_name = {}
        for row in api_rows:
            p    = json.loads(row["payload"])
            name = p.get("name", "unknown")
            ms   = p.get("duration_ms")
            if ms is not None:
                api_by_name.setdefault(name, []).append(ms)
        api_summary = {
            name: {"avg_ms": round(sum(t)/len(t)), "calls": len(t)}
            for name, t in api_by_name.items()
        }

        chip_rows = c.execute(
            "SELECT payload FROM events WHERE type='user.chip_tap' AND timestamp > ?", (since,)
        ).fetchall()
        chip_counts = {}
        for row in chip_rows:
            chip = json.loads(row["payload"]).get("chip", "unknown")
            chip_counts[chip] = chip_counts.get(chip, 0) + 1
        top_chips = sorted(chip_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        search_rows = c.execute(
            "SELECT payload FROM events WHERE type='user.search' AND timestamp > ?", (since,)
        ).fetchall()
        search_counts = {}
        for row in search_rows:
            q = json.loads(row["payload"]).get("query", "")[:50]
            if q:
                search_counts[q] = search_counts.get(q, 0) + 1
        top_searches = sorted(search_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        detail_rows = c.execute(
            "SELECT payload FROM events WHERE type='user.detail_view' AND timestamp > ?", (since,)
        ).fetchall()
        place_counts = {}
        for row in detail_rows:
            place = json.loads(row["payload"]).get("place", "")
            if place:
                place_counts[place] = place_counts.get(place, 0) + 1
        top_places = sorted(place_counts.items(), key=lambda x: x[1], reverse=True)[:10]

        save_rows = c.execute(
            "SELECT payload FROM events WHERE type='user.save' AND timestamp > ?", (since,)
        ).fetchall()
        saves   = sum(1 for r in save_rows if json.loads(r["payload"]).get("action") == "save")
        unsaves = sum(1 for r in save_rows if json.loads(r["payload"]).get("action") == "unsave")

        error_count = c.execute(
            "SELECT COUNT(*) as cnt FROM events WHERE type LIKE 'error.%' AND timestamp > ?", (since,)
        ).fetchone()["cnt"]

        nav_rows = c.execute(
            "SELECT payload FROM events WHERE type='user.navigation' AND timestamp > ?", (since,)
        ).fetchall()
        nav_counts = {}
        for row in nav_rows:
            tab = json.loads(row["payload"]).get("tab", "unknown")
            nav_counts[tab] = nav_counts.get(tab, 0) + 1

        fb = c.execute(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM feedback WHERE created_at > ?", (since,)
        ).fetchone()

        conn.close()

        return {
            "period_days": days,
            "sessions":    sessions,
            "performance": {"avg_page_load_ms": avg_load, "api_calls": api_summary},
            "engagement":  {
                "top_chip_taps":   top_chips,
                "top_searches":    top_searches,
                "top_places":      top_places,
                "saves":           saves,
                "unsaves":         unsaves,
                "navigation_tabs": nav_counts,
            },
            "quality": {
                "error_count":    error_count,
                "feedback_avg":   round(fb["avg_rating"], 2) if fb["avg_rating"] else None,
                "feedback_count": fb["cnt"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/errors")
def get_errors(limit: int = 50, days: int = 7):
    try:
        conn  = get_analytics_db()
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()
        rows  = conn.execute(
            """SELECT session_id, timestamp, type, payload FROM events
               WHERE type LIKE 'error.%' AND timestamp > ?
               ORDER BY timestamp DESC LIMIT ?""",
            (since, limit)
        ).fetchall()
        conn.close()
        return {
            "errors": [
                {"session_id": r["session_id"], "timestamp": r["timestamp"],
                 "type": r["type"], **json.loads(r["payload"])}
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/feedback")
def get_feedback(limit: int = 100):
    try:
        conn = get_analytics_db()
        rows = conn.execute(
            "SELECT * FROM feedback ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        by_screen = conn.execute(
            "SELECT screen, AVG(rating) as avg, COUNT(*) as cnt FROM feedback GROUP BY screen"
        ).fetchall()
        conn.close()
        return {
            "submissions": [dict(r) for r in rows],
            "by_screen": [
                {"screen": r["screen"], "avg_rating": round(r["avg"], 2), "count": r["cnt"]}
                for r in by_screen
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────────────────────
# Serve React frontend — must be LAST
# ─────────────────────────────────────────────────────────────────────────────

app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
