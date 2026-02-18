"use client"

import React from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 rounded-full bg-red-500/10 p-4">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-[#94A3B8]">
            An unexpected error occurred. You can try again or go back to the dashboard.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mb-6 max-w-lg overflow-auto rounded-lg border border-[#2A2D3A] bg-[#1A1D27] p-4 text-left text-xs text-red-400">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <Button
              onClick={this.handleReset}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="border-[#2A2D3A] text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
