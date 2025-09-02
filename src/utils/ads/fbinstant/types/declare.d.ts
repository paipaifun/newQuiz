// @ts-ignore
declare global {
  // @ts-ignore
  var FBInstant: FBInstant; // 忽略严格的TS检查
}

// declare var eruda: any;

declare interface Window {
  onGameStarted: (() => Promise<void>) | undefined;

  analytics:
    | {
        shared: any;
        logEvent: (analytics: any, event: string, params: any) => void;
        setUserId: (uid: string) => void;
      }
    | undefined;
}

declare interface Date {
  format: (date: string) => string;
}
