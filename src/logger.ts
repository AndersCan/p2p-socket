let logLevel = 50;

export function setLogLevel(newLogLevel: 30 | 40 | 50 | 60) {
  logLevel = newLogLevel;
}

export function getLogger() {
  return {
    info: (...msg: any[]) => {
      if (logLevel >= 30) {
        console.log(...msg);
      }
    },
    warn: (...msg: any[]) => {
      if (logLevel >= 40) {
        console.log(...msg);
      }
    },
    error: (...msg: any[]) => {
      if (logLevel >= 50) {
        console.log(...msg);
      }
    },
    fatal: (...msg: any[]) => {
      if (logLevel >= 60) {
        console.log(...msg);
      }
    },
  };
}
