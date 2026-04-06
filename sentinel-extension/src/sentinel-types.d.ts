// Sentinel AI: Global Operative Type Declarations
// This clears 'Red' IDE errors by manually defining the Chrome Extensions API.

declare namespace chrome {
  export namespace runtime {
    export function onMessage(request: any, sender: any, sendResponse: (response: any) => void): void;
    export const onMessage: {
      addListener(callback: (request: any, sender: any, sendResponse: (response: any) => void) => boolean | void): void;
    };
    export function sendMessage(message: any, callback?: (response: any) => void): void;
  }
  export namespace action {
    export function openPopup(): void;
  }
  export namespace commands {
    export const onCommand: {
      addListener(callback: (command: string) => void): void;
    };
  }
  export namespace tabs {
    export function query(queryInfo: any): Promise<any[]>;
    export function sendMessage(tabId: number, message: any): Promise<any>;
  }
}

declare const chrome: any;
