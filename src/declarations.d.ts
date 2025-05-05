// declarations.d.ts
declare module 'react-native-call-detection' {
    const CallDetectionManager: {
      startListener: (callback: (event: any) => void) => void;
      stopListener: () => void;
    };
    export default CallDetectionManager;
  }
  
  declare module 'react-native-contact-picker' {
    export function pickContact(): Promise<{ name: string; phoneNumber: string }>;
  }

  declare module 'react-native-telephony';