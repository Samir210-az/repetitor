import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Tətbiqdə xəta baş verdi:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Bir xəta baş verdi 😕</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.7, maxWidth: "24rem" }}>
            Səhifə gözlənilməz nəticə ilə qarşılaşdı. Bu adətən müvəqqətidir — "Yenidən yüklə"
            düyməsinə basaraq davam edə bilərsən. Problem təkrarlanarsa, bu addımı bizə bildir.
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              background: "#111827",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Yenidən yüklə
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
