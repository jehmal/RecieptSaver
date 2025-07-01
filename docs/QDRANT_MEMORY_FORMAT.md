# Correct Qdrant Memory Storage Format

## Python Dictionary Format (What Actually Works)

When using the `mcp__qdrant__qdrant-store` tool, you must pass metadata as a Python dictionary object, NOT a JSON string.

### ✅ CORRECT Format:

```python
# Store memory with proper metadata
mcp__qdrant__qdrant-store(
    information="Your memory text here...",
    metadata={
        "type": "error_solution",
        "category": "type_mismatch",
        "severity": "high",
        "tools": ["react_native", "typescript"],
        "tags": ["error", "solution"],
        "timestamp": "2025-01-01T10:00:00Z",
        "confidence": 0.99
    }
)
```

### ❌ INCORRECT Formats:

```python
# WRONG - JSON string
metadata='{"type": "error_solution", "category": "type_mismatch"}'

# WRONG - Multiline JSON string
metadata="""{
    "type": "error_solution",
    "category": "type_mismatch"
}"""

# WRONG - Dict wrapped in quotes
metadata="{'type': 'error_solution'}"
```

## Complete Working Example

Here's the exact format for storing error solutions:

```python
# Memory text
information = """
ERROR PATTERN DETECTED AND RESOLVED:
Type: type_mismatch_error
Error: receiptData.amount.toFixed is not a function
Root Cause: Data type inconsistency
Solution: Implement defensive type checking -> Add Number() conversion
Prevention: Always normalize data at entry points
Context: React Native app at 2025-01-01T10:00:00Z
"""

# Metadata as Python dict (NOT string!)
metadata = {
    "type": "error_solution",
    "category": "type_mismatch",
    "severity": "high",
    "tools": ["react_native", "typescript", "javascript"],
    "tags": ["toFixed", "type_error", "amount", "currency_formatting"],
    "timestamp": "2025-01-01T10:00:00Z",
    "confidence": 0.99,
    "error_pattern": "X.toFixed is not a function",
    "root_cause": "type_inconsistency",
    "prevention_strategy": "defensive_type_checking",
    "reusability": "high",
    "domain": "frontend_development"
}

# Store it
qdrant_store(information=information, metadata=metadata)
```

## Key Rules

1. **Metadata MUST be a Python dictionary**, not a JSON string
2. **Arrays/Lists** in metadata should use Python list syntax: `["item1", "item2"]`
3. **Numbers** should be actual numbers: `0.99` not `"0.99"`
4. **Booleans** should be Python booleans: `True/False` not `"true"/"false"`
5. **No trailing commas** in the dictionary

## Common Metadata Fields

### For Error Solutions:
```python
{
    "type": "error_solution",
    "category": "type_mismatch|syntax_error|runtime_error|logic_error",
    "severity": "low|medium|high|critical",
    "tools": ["tool1", "tool2"],
    "tags": ["tag1", "tag2"],
    "timestamp": "ISO-8601 format",
    "confidence": 0.0-1.0,
    "error_pattern": "the error message pattern",
    "root_cause": "why it happened",
    "prevention_strategy": "how to avoid",
    "reusability": "low|medium|high",
    "domain": "frontend|backend|database|etc"
}
```

### For Knowledge/Learning:
```python
{
    "type": "knowledge|learning|pattern|insight",
    "domain": "technical area",
    "topic": "specific topic",
    "confidence": 0.0-1.0,
    "timestamp": "ISO-8601 format",
    "related_concepts": ["concept1", "concept2"],
    "practical_use": "when to apply",
    "verification_status": "tested|theoretical|partial"
}
```

### For Task Performance:
```python
{
    "type": "task_performance",
    "task_id": "unique identifier",
    "success": True|False,
    "attempts": number,
    "duration": "time taken",
    "errors_encountered": ["error1", "error2"],
    "lessons_learned": ["lesson1", "lesson2"],
    "pattern_name": "reusable pattern name",
    "timestamp": "ISO-8601 format"
}
```

## Testing Your Format

Before storing, test your metadata format:

```python
# Test if it's a valid Python dict
metadata = {...}  # Your metadata
print(type(metadata))  # Should output: <class 'dict'>
print(metadata)  # Should show the dictionary content
```

Remember: The MCP Qdrant tool expects a Python dictionary object, not a JSON string!