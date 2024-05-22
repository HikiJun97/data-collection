import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("time-element")
export default class TimeElement extends LitElement {
  static styles = css`
    :host {
      font-family: sans-serif;
    }

    #time_wrapper {
      height: 50px;
      min-width: 80px;
      position: relative;
      border: solid;
      border-color: silver;
      border-radius: 10px;
      box-shadow: inset 0px 0.6px 5px 1.4px silver;
    }

    #time_input {
      border: 1px solid var(--inactive);
      width: 100%;
      height: 50px;
      color: gray;
      display: flex;
      align-items: center;
    }

    input {
      align-self: stretch;
      width: 33%;
      border: none;
      border-radius: 10px;
      box-sizing: border-box;
      padding: auto 10px;
      text-align: center;
      color: #132c14;
      background-color: rgba(0, 0, 0, 0);
    }

    label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .label {
      font-size: 0.55rem;
      position: absolute;
      top: 4.5px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type="number"] {
      -moz-appearance: textfield;
    }

    input.invalid:focus {
      outline: 3px solid red;
    }

    input.invalid:focus + .label {
      color: red;
    }

    #error {
      position: relative;
      margin: 0 auto;
      color: red;
      visibility: hidden;
    }
  `;

  @property({ type: String }) hours: string = "0";
  @property({ type: String }) minutes: string = "00";
  @property({ type: String }) seconds: string = "00";

  render() {
    return html`
      <div id="time_wrapper">
        <div id="time_input">
          <input
            type="number"
            id="hours"
            .value=${this.hours}
            @input=${this.handleChange}
          />
          <span>:</span>
          <input
            type="number"
            id="minutes"
            .value=${this.minutes}
            @input=${this.handleChange}
          />
          <span>:</span>
          <input
            type="number"
            id="seconds"
            .value=${this.seconds}
            @input=${this.handleChange}
          />
        </div>
      </div>
      <div id="error"></div>
    `;
  }

  handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const { id, value } = target;
    (this as any)[id] = value;
  }

  getTimeValues() {
    return {
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
    };
  }
}
