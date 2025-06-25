from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("API key for Groq is missing. Please set GROQ_API_KEY in the .env file.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=api_key)

class ChatInput(BaseModel):
    message: str
    role: str = "user"
    conversation_id: str = "default"

conversations = {}

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend is running!"}

@app.post("/chat")
async def chat(user_input: ChatInput):
    conv_id = user_input.conversation_id
    if conv_id not in conversations:
        conversations[conv_id] = []
    conversations[conv_id].append({"role": user_input.role, "content": user_input.message})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # or another Groq-supported model
        messages=conversations[conv_id],
        temperature=1,
        max_tokens=1024
    )
    bot_message = response.choices[0].message.content
    conversations[conv_id].append({"role": "assistant", "content": bot_message})
    return {"response": bot_message, "conversation_id": conv_id}
