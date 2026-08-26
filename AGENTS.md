# Coding Guidelines

- Prefer the simplest efficient implementation.
- Do not create unnecessary helper, mapper, formatter, or transformation functions.
- Shape database queries around the required output.
- Fetch only the fields actually needed; avoid fetching full records and filtering afterward.
- Push filtering, projection, aggregation, sorting, and limits into the database/query layer when appropriate.
- Reuse existing functions and project patterns before creating new abstractions.
- Only create a new function when it meaningfully improves reuse, readability, or separation of concerns.
- Avoid unnecessary intermediate transformations.
- Preserve existing architecture and conventions.
