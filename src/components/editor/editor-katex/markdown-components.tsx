"use client";

import { Components } from "react-markdown";
import { LinkComponent } from "./markdown-components/link";
import { CodeBlock } from "./markdown-components/code";
import {
  H1Component,
  H2Component,
  H3Component,
  H4Component,
  H5Component,
  H6Component,
} from "./markdown-components/headings";
import {
  UlComponent,
  OlComponent,
  LiComponent,
} from "./markdown-components/lists";
import {
  TableComponent,
  TheadComponent,
  TbodyComponent,
  TrComponent,
  ThComponent,
  TdComponent,
} from "./markdown-components/table";
import { PComponent } from "./markdown-components/p";
import { StrongComponent } from "./markdown-components/strong";
import { EmComponent } from "./markdown-components/em";
import { DelComponent } from "./markdown-components/del";
import { HrComponent } from "./markdown-components/hr";
import { BlockquoteComponent } from "./markdown-components/blockquote";
import { ImgComponent } from "./markdown-components/img";

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
