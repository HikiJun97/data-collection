export default class TimeElement extends HTMLElement {
    hours;
    minutes;
    seconds;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hours = "0";
        this.minutes = "00";
        this.seconds = "00";
        this.handleChange = this.handleChange.bind(this);
    }
    static get observedAttributes() {
        return ['hours', 'minutes', 'seconds'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue !== null) {
            this[name] = newValue;
            this.update();
        }
    }
    connectedCallback() {
        this.render();
    }
    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
        <style>
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
        </style>
        <div id="time_wrapper">
          <div id="time_input">
            <input
              type="number"
              id="hours"
              value="${this.hours}"
              />
            <span>:</span>
            <input
              type="number"
              id="minutes"
              value="${this.minutes}"
              />
            <span>:</span>
            <input
              type="number"
              id="seconds"
              value="${this.seconds}"
              />
          </div>
        </div>
        <div id="error"></div>
      `;
            this.shadowRoot.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', this.handleChange);
            });
        }
    }
    handleChange(event) {
        const target = event.target;
        const { id, value } = target;
        this[id] = value;
        this.setAttribute(id, value);
    }
    getTimeValues() {
        return {
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds,
        };
    }
    update() {
        if (this.shadowRoot) {
            const hoursInput = this.shadowRoot.getElementById('hours');
            const minutesInput = this.shadowRoot.getElementById('minutes');
            const secondsInput = this.shadowRoot.getElementById('seconds');
            if (hoursInput)
                hoursInput.value = this.hours;
            if (minutesInput)
                minutesInput.value = this.minutes;
            if (secondsInput)
                secondsInput.value = this.seconds;
        }
    }
}
customElements.define('time-element', TimeElement);
