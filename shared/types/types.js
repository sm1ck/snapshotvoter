export const INPUT_TYPE = Object.freeze({
  PROJECT: Symbol("project"),
  PROPOLSAL: Symbol("propolsal"),
  SELECTOR: Symbol("selector"),
  SLEEP: Symbol("sleep"),
});

export const RADIO_BUTTON_TYPE = Object.freeze({
  VOTE: Symbol("vote"),
});

export const CHECKBOX_TYPE = Object.freeze({
  PARSEPROPS: Symbol("parseProps"),
});

export const EVENTS_TYPE = Object.freeze({
  HELP: Symbol("snapshotvoter:helpEvent"),
  CHECKBOX: Symbol("snapshotvoter:checkBoxEvent"),
  CLEAR: Symbol("clear"),
});

export const WS_TYPE = Object.freeze({
  VOTE: "vote",
  SUBSCRIBE: "subscribe",
  INFO: "info",
  END: "end",
  ERROR: "error",
  ERROR_END: "errorEnd",
});
