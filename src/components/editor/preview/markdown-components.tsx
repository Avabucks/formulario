"use client";

import { Components } from "react-markdown";
import { LinkComponent } from "../preview/markdown-components/link";
import { CodeBlock } from "../preview/markdown-components/code";
import {
  H1Component,
  H2Component,
  H3Component,
  H4Component,
  H5Component,
  H6Component,
} from "../preview/markdown-components/headings";
import {
  UlComponent,
  OlComponent,
  LiComponent,
} from "../preview/markdown-components/lists";
import {
  TableComponent,
  TheadComponent,
  TbodyComponent,
  TrComponent,
  ThComponent,
  TdComponent,
} from "../preview/markdown-components/table";
import { PComponent } from "../preview/markdown-components/p";
import { StrongComponent } from "../preview/markdown-components/strong";
import { EmComponent } from "../preview/markdown-components/em";
import { DelComponent } from "../preview/markdown-components/del";
import { HrComponent } from "../preview/markdown-components/hr";
import { BlockquoteComponent } from "../preview/markdown-components/blockquote";
import { ImgComponent } from "../preview/markdown-components/img";

export const markdownComponents: Components = {
  h1: H1Component,
  h2: H2Component,
  h3: H3Component,
  h4: H4Component,
  h5: H5Component,
  h6: H6Component,
  p: PComponent,
  ul: UlComponent,
  ol: OlComponent,
  li: LiComponent,
  strong: StrongComponent,
  em: EmComponent,
  del: DelComponent,
  hr: HrComponent,
  blockquote: BlockquoteComponent,
  code: CodeBlock,
  img: ImgComponent,
  a: LinkComponent,
  table: TableComponent,
  thead: TheadComponent,
  tbody: TbodyComponent,
  tr: TrComponent,
  th: ThComponent,
  td: TdComponent,
};

// TODO: checkbox
