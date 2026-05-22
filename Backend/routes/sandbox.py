"""Sandbox routes — self-code generation and tool management."""

from fastapi import APIRouter
from models.schemas import SandboxRequest
from services.sandbox import get_sandbox_service

router = APIRouter()


@router.post("/generate")
async def generate_tool(request: SandboxRequest):
    """Generate and test a new tool."""
    sandbox = get_sandbox_service()
    result = await sandbox.generate_tool(
        description=request.description,
        test_input=request.test_input,
        expected_output=request.expected_output,
    )
    return result


@router.get("/tools")
async def list_tools():
    """List all generated tools."""
    sandbox = get_sandbox_service()
    return {"tools": sandbox.list_tools()}
