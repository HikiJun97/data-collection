import TimeElement from "./TimeElement";

declare global {
  interface HTMLElementTagNameMap {
    "time-element": TimeElement;
  }
}

interface Window {
  fromPath?: string;
}
