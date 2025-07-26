declare module 'leo-profanity' {
  interface LeoProfanity {
    list: () => string[];
    add: (words: string | string[]) => void;
    remove: (words: string | string[]) => void;
    reset: () => void;
    clearList: () => void;
    check: (string: string) => boolean;
    clean: (string: string, replaceKey?: string) => string;
    loadDictionary: (lang: string) => void;
    getDictionary: (lang: string) => string[];
  }

  const leoProfanity: LeoProfanity;
  export default leoProfanity;
}