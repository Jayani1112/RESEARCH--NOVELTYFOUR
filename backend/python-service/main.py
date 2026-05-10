import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from collections import Counter

load_dotenv()

app = FastAPI(title="POS Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/novelty4_pos")
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database()
orders_collection = db.get_collection("orders")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the POS Recommendation Engine API"}

@app.get("/api/recommendations")
async def get_recommendations(productId: str):
    if not productId:
        raise HTTPException(status_code=400, detail="productId is required")
        
    try:
        # Find all orders that contain this productId
        # Based on Node.js model: items.[].productId
        # Since we might have seeded with strings or ObjectIds, let's query both or just name if it's easier.
        # But wait, we seed ObjectIds in seed.js. Let's just query by productId.
        # To handle ObjectId from str, we might need bson, but Motor handles string queries if we stored them as string, or we need ObjectId.
        from bson import ObjectId
        
        try:
            obj_id = ObjectId(productId)
            query = {"items.productId": obj_id}
        except:
            # If not a valid ObjectId, maybe it's stored as string
            query = {"items.productId": productId}
            
        cursor = orders_collection.find(query)
        orders = await cursor.to_list(length=1000)
        
        if not orders:
            return {"recommendedProducts": []}
            
        # Co-occurrence counting
        co_purchased = []
        for order in orders:
            for item in order.get("items", []):
                # Don't recommend the item itself
                if str(item.get("productId")) != productId:
                    co_purchased.append((str(item.get("productId")), item.get("name"), item.get("price")))
                    
        if not co_purchased:
            return {"recommendedProducts": []}
            
        # Count frequencies
        counter = Counter(co_purchased)
        total_co_occurrences = sum(counter.values())
        
        # Get top 3 recommendations
        top_items = counter.most_common(3)
        
        recommendations = []
        for item, count in top_items:
            confidence = round((count / total_co_occurrences) * 100, 2)
            recommendations.append({
                "productId": item[0],
                "name": item[1],
                "price": item[2],
                "confidence": confidence
            })
            
        return {"recommendedProducts": recommendations}
        
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
