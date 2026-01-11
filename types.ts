

export enum FestivalType {
  SPRING_FESTIVAL = '春节',
  MID_AUTUMN = '中秋节',
  NATIONAL_DAY = '国庆节',
  LANTERN_FESTIVAL = '元宵节',
  DRAGON_BOAT = '端午节',
  LABOR_DAY = '五一劳动节',
  NEW_YEAR = '元旦',
  ANNIVERSARY = '企业周年庆'
}

export enum TargetAudience {
  FAMILY = '家人',
  FRIENDS = '朋友',
  COLLEAGUES = '同事',
  BUSINESS_PARTNERS = '商业伙伴',
  GOVERNMENT = '政府部门/领导',
  CUSTOMERS = '广大客户'
}

export interface GreetingState {
  festival: FestivalType;
  audience: TargetAudience;
  keywords: string;
  generatedText: string;
  imageUrl: string;
  videoUrl: string;
  audioUrl: string;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  isGeneratingVideo: boolean;
  isGeneratingAudio: boolean;
}

// 定义 AIStudio 接口以匹配全局定义并解决类型冲突
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// 扩展全局 Window 接口以包含 custom 属性，解决 TypeScript 编译错误
declare global {
  interface Window {
    markAppStarted?: () => void;
    // 使用 AIStudio 接口解决后续属性声明必须具有相同类型的问题
    aistudio?: AIStudio;
  }
}