import React from "react";
import tempData from "./data";

import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.loggerRef = null;
    this.state = {
      chomogen: "blue",
      acidApplied: false,
      timerOn: false,
      start: null,
      values: tempData,
      timer: null,
      timerStamp: null,
      displayStamp: null,
      log: []
    };
  }

  processValue(val, seconds, idealWaitSec = 1800) {
    const od = Math.min(0.03 + (seconds / 1800) * val.value, 2);
    val.od = od;
    val.opacity = od / 2;
    return val;
  }

  processValues() {
    const { values, timerStamp } = this.state;
    const seconds = timerStamp / 1000;
    for (let i = 0, x = values.length; i < x; i++) {
      values[i].map(val => this.processValue(val, seconds));
    }
    this.setState({ values });
  }

  handleCountupFast() {
    const { timerStamp, displayStamp } = this.state;
    const stamp = timerStamp + 20 * 1000;
    const display = displayStamp + 20 * 1000;
    this.setState({ timerStamp: stamp, displayStamp: display });
    this.processValues();
  }

  handleWait() {
    const { timerOn, timerStamp, displayStamp } = this.state;
    const start = +new Date();

    if (timerOn === true) {
      this.logStep({ action: "wait", timerStamp, displayStamp });
      return this.setState({
        timer: clearInterval(this.state.timer),
        timerOn: false,
        displayStamp: null
      });
    }

    this.setState({
      start,
      timer: setInterval(() => this.handleCountupFast(), 200),
      timerOn: true,
      displayStamp: null
    });
  }

  handleAcid() {
    if (this.state.timerOn) this.handleWait();
    this.setState({ acidApplied: true });
    this.logStep({ action: "acid" });
  }

  logStep(step) {
    const { log } = this.state;
    const message = {
      default: ``,
      wait: `Waited ${this.getTimerMins(step.displayStamp)} minutes.`,
      acid: `Acid applied.`
    }[step.action || "default"];
    log.push({ ...step, message });
    this.setState({ log }, () => {
      this.loggerRef.scrollTop = this.loggerRef.scrollHeight;
    });
  }

  getTimerMins(stamp) {
    const min = Math.round(+new Date(stamp) / 1000 / 60);
    return min;
  }

  renderWell(well, key) {
    const { chromogen, acidApplied } = this.state;
    const style = {
      opacity: well.opacity,
      background: acidApplied ? "yellow" : chromogen
    };
    return (
      <div key={`well-${key}`} className="well">
        <div style={style} className="contents" />
      </div>
    );
  }

  renderTime(stamp) {
    return `${this.getTimerMins(stamp)} min`;
  }

  render() {
    const { values, timerOn, log, displayStamp, acidApplied } = this.state;

    return (
      <div className="app-layout">
        <div>
          {/* <button onClick={({ nativeEvent }) => handleWash(nativeEvent)}>
          Wash
        </button>
        <button onClick={({ nativeEvent }) => handleWait(nativeEvent)}>
          Wait
        </button>
        <button>Coat plate</button>
        <button>Apply antibody</button>
        <button>Apply enzyme</button>
        <button>Apply chromogen</button>*/}
          <button
            onClick={() => this.handleAcid()}
            // disabled={timerOn || acidApplied}
          >
            Apply sulphuric acid
          </button>
        </div>

        <div>
          <button
            disabled={acidApplied}
            aria-pressed={timerOn}
            onClick={({ nativeEvent }) => this.handleWait(nativeEvent)}
          >
            {timerOn ? "Wait Stop" : "Wait Start"}
          </button>
          <span>{this.renderTime(displayStamp)}</span>
        </div>

        <div>
          <div ref={me => (this.loggerRef = me)} className="logger">
            {log.map((step, i) => (
              <div key={`step-${i}`}>{step.message}</div>
            ))}
          </div>
        </div>
        <div className="plate" data-acid={acidApplied}>
          {values.map((set, key) => (
            <div key={key}>{set.map((v, i) => this.renderWell(v, i))}</div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;
