from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import DistilBertTokenizer
from model_loader import load_model
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = None
tokenizer = None

@app.on_event("startup")
async def startup_event():
    global model, tokenizer
    try:
        print("Loading model and tokenizer...")
        model = load_model('models/model.pth', device)
        tokenizer = DistilBertTokenizer.from_pretrained('models/tokenizer')
        print("Model and tokenizer loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise e

class TextInput(BaseModel):
    text: str

@app.post("/analyze")
async def analyze_text(input: TextInput):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    try:
        encoded = tokenizer(
            input.text,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors='pt'
        )

        with torch.no_grad():
            outputs = model(encoded['input_ids'].to(device), 
                          encoded['attention_mask'].to(device))
            scores = outputs.cpu().numpy()[0] * 1.5

        suggestions = []
        if scores[0] < 0.85:
            suggestions.append("Consider varying your sentence structure.")
        if scores[1] < 0.7:
            suggestions.append("Try adding more technical details.")
        if scores[2] < 0.8:
            suggestions.append("Paragraph transitions can be worked on.")

        return {
            'scores': {
                'structure': float(scores[0] * 100),
                'technical': float(scores[1] * 100),
                'coherence': float(scores[2] * 100)
            },
            'suggestions': suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}