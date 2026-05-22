"""
Sandbox service — self-code generation and execution.
AI writes, tests, and hot-swaps its own Python tools in isolated Docker containers.
"""

import os
import subprocess
import tempfile
import time
from typing import Optional
from config import get_settings

SANDBOX_DIR = os.path.join(os.path.dirname(__file__), "..", "sandbox")
MAX_RETRIES = 3


class SandboxService:
    def __init__(self):
        os.makedirs(SANDBOX_DIR, exist_ok=True)

    async def generate_tool(
        self, description: str, test_input: str, expected_output: Optional[str] = None
    ) -> dict:
        """Generate, test, and register a Python tool."""
        from services.brain import get_brain_service

        brain = get_brain_service()

        # Generate code using LLM
        code = await self._generate_code(brain, description, test_input)

        # Test in sandbox
        for attempt in range(MAX_RETRIES):
            result = self._run_in_sandbox(code, test_input)

            if result["success"]:
                if expected_output and expected_output not in result["output"]:
                    result["success"] = False
                    result["error"] = f"Output mismatch. Expected '{expected_output}', got '{result['output']}'"
                    # Regenerate with error context
                    code = await self._fix_code(brain, code, result["error"])
                    continue

                # Save tool
                tool_path = self._save_tool(description, code)
                return {
                    "success": True,
                    "script_path": tool_path,
                    "output": result["output"],
                }
            else:
                # Regenerate with error context
                code = await self._fix_code(brain, code, result["error"])

        return {
            "success": False,
            "error": f"Failed after {MAX_RETRIES} attempts",
            "output": None,
        }

    async def _generate_code(self, brain, description: str, test_input: str) -> str:
        """Use LLM to generate Python code for a tool."""
        prompt = f"""Write a Python function called `run` that takes a string input and returns a string output.

Description: {description}
Test input: {test_input}

Rules:
- Only use standard library
- Function signature: def run(input_data: str) -> str
- Include error handling
- Output ONLY the Python code, no explanations"""

        result = await brain.process(user_input=prompt)
        code = result["response"]

        # Extract code block if wrapped
        if "```python" in code:
            code = code.split("```python")[1].split("```")[0]
        elif "```" in code:
            code = code.split("```")[1].split("```")[0]

        return code.strip()

    async def _fix_code(self, brain, code: str, error: str) -> str:
        """Fix code based on error message."""
        prompt = f"""This Python code has an error. Fix it.

Code:
```python
{code}
```

Error: {error}

Output ONLY the corrected Python code, no explanations."""

        result = await brain.process(user_input=prompt)
        fixed = result["response"]

        if "```python" in fixed:
            fixed = fixed.split("```python")[1].split("```")[0]
        elif "```" in fixed:
            fixed = fixed.split("```")[1].split("```")[0]

        return fixed.strip()

    def _run_in_sandbox(self, code: str, test_input: str) -> dict:
        """Execute code in isolated Docker container."""
        settings = get_settings()

        # Write code to temp file
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, dir=SANDBOX_DIR
        ) as f:
            wrapper = f"""
import sys
{code}

if __name__ == "__main__":
    try:
        result = run("{test_input}")
        print(result)
    except Exception as e:
        print(f"ERROR: {{e}}", file=sys.stderr)
        sys.exit(1)
"""
            f.write(wrapper)
            tmp_path = f.name

        try:
            result = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "--network=none",
                    "--memory=128m",
                    "--cpus=0.5",
                    "-v", f"{os.path.abspath(tmp_path)}:/script.py:ro",
                    settings.sandbox_image,
                    "python", "/script.py",
                ],
                capture_output=True,
                text=True,
                timeout=30,
            )

            if result.returncode == 0:
                return {"success": True, "output": result.stdout.strip()}
            else:
                return {"success": False, "error": result.stderr.strip()}

        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Execution timed out (30s)"}
        except Exception as e:
            return {"success": False, "error": str(e)}
        finally:
            os.unlink(tmp_path)

    def _save_tool(self, description: str, code: str) -> str:
        """Save a validated tool to the sandbox directory."""
        safe_name = description[:30].replace(" ", "_").lower()
        filename = f"tool_{safe_name}_{int(time.time())}.py"
        path = os.path.join(SANDBOX_DIR, filename)

        with open(path, "w") as f:
            f.write(f"# Auto-generated tool: {description}\n")
            f.write(f"# Created: {time.ctime()}\n\n")
            f.write(code)

        return path

    def list_tools(self) -> list[dict]:
        """List all generated tools."""
        tools = []
        for f in os.listdir(SANDBOX_DIR):
            if f.startswith("tool_") and f.endswith(".py"):
                path = os.path.join(SANDBOX_DIR, f)
                with open(path, "r") as fh:
                    first_line = fh.readline().strip()
                tools.append({"filename": f, "description": first_line, "path": path})
        return tools


sandbox_service: Optional[SandboxService] = None


def get_sandbox_service() -> SandboxService:
    global sandbox_service
    if sandbox_service is None:
        sandbox_service = SandboxService()
    return sandbox_service
