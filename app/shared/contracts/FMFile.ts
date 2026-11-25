export interface FMFile {
  type: string;
  name: string;
  added?: Date;
  files?: FMFile[];
}
