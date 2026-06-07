import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  // React Router thrown responses
  if (isRouteErrorResponse(error)) {
    return (
      <section className="state-panel">
        <div className="state-card">
          <span>{error.status}</span>
        <h1>Route Error</h1>

        <p>{error.statusText}</p>
        </div>
      </section>
    );
  }

  // Normal JS errors
  return (
    <section className="state-panel">
      <div className="state-card">
        <span>Error</span>
        <h1>Application Error</h1>

        <p>{error.message}</p>
      </div>
    </section>
  );
}
