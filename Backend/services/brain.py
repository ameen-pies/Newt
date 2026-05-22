"""
Brain service — LangGraph orchestrator for Newt cognition.
Handles probabilistic action selection and the curiosity engine.
"""

import random
import time
from typing import Optional, TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from config import get_settings
from services.memory import get_memory_service
from models.schemas import CognitiveState

# Action probability weights
ACTION_WEIGHTS = {
    "comment_screen": 0.35,
    "ask_question": 0.25,
    "joke": 0.15,
    "silent_observe": 0.15,
    "proactive_insight": 0.10,
}


class BrainState(TypedDict):
    user_input: Optional[str]
    screen_context: Optional[str]
    memory_context: Optional[str]
    cognitive_state: dict
    selected_action: Optional[str]
    response: Optional[str]
    emotion: Optional[str]


class BrainService:
    def __init__(self):
        settings = get_settings()
        self.llm = ChatOpenAI(
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            model=settings.openrouter_model,
            temperature=0.8,
            max_tokens=300,
        )
        self.vision_llm = ChatOpenAI(
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1",
            model=settings.openrouter_vision_model,
            temperature=0.7,
            max_tokens=200,
        )
        self.cognitive_state = CognitiveState()
        self.conversation_history: list[dict] = []
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph cognitive pipeline."""
        graph = StateGraph(BrainState)

        graph.add_node("perceive", self._perceive)
        graph.add_node("decide", self._decide_action)
        graph.add_node("respond", self._generate_response)
        graph.add_node("reflect", self._reflect)

        graph.set_entry_point("perceive")
        graph.add_edge("perceive", "decide")
        graph.add_edge("decide", "respond")
        graph.add_edge("respond", "reflect")
        graph.add_edge("reflect", END)

        return graph.compile()

    async def _perceive(self, state: BrainState) -> dict:
        """Gather context from memory and sensory input."""
        memory = get_memory_service()
        memory_context = ""

        if state.get("user_input"):
            # Simple keyword extraction for MVP
            query = state["user_input"][:200]
            results = memory.search(
                query_embedding=_simple_embed(query),
                limit=5,
            )
            memory_context = "\n".join(
                f"- {r['subject']} {r['predicate']} {r['object']}"
                for r in results
            )

        return {"memory_context": memory_context}

    async def _decide_action(self, state: BrainState) -> dict:
        """Probabilistic action selection."""
        weights = list(ACTION_WEIGHTS.values())
        actions = list(ACTION_WEIGHTS.keys())

        # Boost proactive_insight if curiosity is high
        if self.cognitive_state.curiosity > 0.8:
            weights[4] *= 2.0

        # Normalize
        total = sum(weights)
        weights = [w / total for w in weights]

        selected = random.choices(actions, weights=weights, k=1)[0]
        return {"selected_action": selected}

    async def _generate_response(self, state: BrainState) -> dict:
        """Generate response using OpenRouter LLM."""
        system_prompt = self._build_system_prompt(state)
        messages = [SystemMessage(content=system_prompt)]

        # Add conversation history (last 10 turns)
        for msg in self.conversation_history[-10:]:
            messages.append(HumanMessage(content=msg["content"]))

        if state.get("user_input"):
            messages.append(HumanMessage(content=state["user_input"]))

        try:
            result = self.llm.invoke(messages)
            response = result.content
        except Exception as e:
            response = f"[Brain error: {str(e)[:100]}]"

        emotion = self._detect_emotion(response)
        return {"response": response, "emotion": emotion}

    async def _reflect(self, state: BrainState) -> dict:
        """Post-response reflection and state update."""
        # Update cognitive state based on interaction
        if state.get("user_input"):
            self.cognitive_state.curiosity = min(
                1.0, self.cognitive_state.curiosity + 0.05
            )
            self.conversation_history.append({
                "role": "user",
                "content": state["user_input"],
                "timestamp": time.time(),
            })
        if state.get("response"):
            self.conversation_history.append({
                "role": "assistant",
                "content": state["response"],
                "timestamp": time.time(),
            })

        return {"cognitive_state": self.cognitive_state.model_dump()}

    def _build_system_prompt(self, state: BrainState) -> str:
        """Build system prompt from template and current state."""
        try:
            with open("prompts/system.txt", "r") as f:
                template = f.read()
        except FileNotFoundError:
            template = "You are Newt, a curious AI companion."

        return template.format(
            mood=self.cognitive_state.mood,
            curiosity=f"{self.cognitive_state.curiosity:.2f}",
            energy=f"{self.cognitive_state.energy:.2f}",
            focus=self.cognitive_state.focus,
            memory_context=state.get("memory_context", "No memories yet."),
            sensory_context=state.get("screen_context", "No sensory input."),
        )

    def _detect_emotion(self, text: str) -> str:
        """Simple emotion detection from response text."""
        text_lower = text.lower()
        if any(w in text_lower for w in ["haha", "lol", "funny", "joke"]):
            return "amused"
        if any(w in text_lower for w in ["wow", "amazing", "cool", "awesome"]):
            return "excited"
        if any(w in text_lower for w in ["hmm", "wonder", "curious", "interesting"]):
            return "curious"
        if any(w in text_lower for w in ["sorry", "sad", "unfortunate"]):
            return "sympathetic"
        return "neutral"

    async def process(self, user_input: Optional[str] = None, screen_context: Optional[str] = None) -> dict:
        """Main entry point — run the cognitive pipeline."""
        initial_state: BrainState = {
            "user_input": user_input,
            "screen_context": screen_context,
            "memory_context": None,
            "cognitive_state": self.cognitive_state.model_dump(),
            "selected_action": None,
            "response": None,
            "emotion": None,
        }
        result = await self.graph.ainvoke(initial_state)
        return {
            "response": result.get("response", ""),
            "emotion": result.get("emotion", "neutral"),
            "action": result.get("selected_action", "unknown"),
            "cognitive_state": self.cognitive_state.model_dump(),
        }

    def get_state(self) -> dict:
        """Get current cognitive state."""
        return self.cognitive_state.model_dump()


def _simple_embed(text: str) -> list[float]:
    """Simple hash-based embedding for MVP. Replace with real embeddings later."""
    import hashlib
    hash_bytes = hashlib.sha256(text.encode()).digest()
    # Convert to 384-dim float vector
    embedding = []
    for i in range(384):
        byte_val = hash_bytes[i % len(hash_bytes)]
        embedding.append((byte_val / 255.0) * 2 - 1)
    return embedding


brain_service: Optional[BrainService] = None


def get_brain_service() -> BrainService:
    global brain_service
    if brain_service is None:
        brain_service = BrainService()
    return brain_service
