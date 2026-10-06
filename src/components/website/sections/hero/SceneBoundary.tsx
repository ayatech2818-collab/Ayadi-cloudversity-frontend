'use client';

import { Component, type ReactNode } from 'react';

type SceneBoundaryProps = {
  /** Called when the scene fails. */
  onError: () => void;
  children: ReactNode;
};

/*
 * Catches the WebGL scene failing to arrive or to mount — its chunk not
 * downloading, the canvas throwing — so AyadiHero can fall back to its still
 * layout instead of the page going down with it. It draws nothing of its
 * own: the opening's logo artwork is still on the page.
 */
export class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
