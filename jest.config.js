module.exports = {
  preset: "@metamask/snaps-jest",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
  testEnvironmentOptions: {
    metamask: {
      mnemonic: "this free core hive util snap keep user keys safe best"
    }
  }
};
