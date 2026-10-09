import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | any | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errMessage = "Unknown Error";
      if (this.state.error?.message) {
        errMessage = this.state.error.message;
      } else if (typeof this.state.error === 'string') {
        errMessage = this.state.error;
      } else {
        try {
          errMessage = JSON.stringify(this.state.error, Object.getOwnPropertyNames(this.state.error));
        } catch(e) {}
      }

      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{errMessage}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
