export class CreateArticleDto {
  title: string;

  blocks: Array<{
    type: string;
    title: string;
    url?: string;
    paragraphs?: Array<string>;
  }>;
  img: string;
}
