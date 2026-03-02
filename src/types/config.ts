export interface ConfigurationData {
    style?: string;
    material?: string;
    soleType?: string;
    detail?: string;
    color?: string;
    size?: string;
    category?: string;
    embellishment?: string;
    [key: string]: string | number | undefined;
  }