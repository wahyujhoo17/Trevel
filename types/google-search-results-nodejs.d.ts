declare module "google-search-results-nodejs" {
  export class GoogleSearch {
    constructor(apiKey: string);

    json(
      params: Record<string, any>,
      callback?: (error: Error | null, response: any) => void
    ): Promise<any>;

    html(
      params: Record<string, any>,
      callback?: (error: Error | null, response: any) => void
    ): Promise<any>;
  }
}
