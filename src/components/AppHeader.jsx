import "./AppHeader.css";

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-brand">
        <img
          className="app-logo"
          src="/focusflow-logo.svg"
          alt="FocusFlow logo"
        />

        <div>
          <h1>FocusFlow</h1>
          <p>Track. Trace. Analyze.</p>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
