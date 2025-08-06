# Reqline

**Author**: Nelson Ayodeji

## Overview

Reqline is a modular HTTP request parser designed to interpret specially structured request line statements and dynamically perform HTTP operations (like GET, POST, etc.) based on them. It emphasizes strict JSON validation, clean module separation, and seamless server integration.

## Project Structure

The project is divided into two main parts:

- The main Express server is located in the `core/express` directory.
- The core logic for parsing and handling `reqline` payloads is located in a dedicated module named `reqlineModule`, which resides at the **root directory** of the project.

This architecture allows the `reqlineModule` to **intercept and integrate** with the Express server without disrupting its structure. The separation ensures clarity, testability, and modular reuse.

## Payload Format

To use Reqline, requests must follow a specific JSON structure.

### Expected Payload Format

```json
{
  "reqline": "[REQLINE STATEMENT]"
}
```

### An Example should look like this

```json
{
  "reqline": "[HTTP GET | URL https://dummyjson.com/quotes/3 | QUERY {\"refid\": 1920933}]"
}
```
