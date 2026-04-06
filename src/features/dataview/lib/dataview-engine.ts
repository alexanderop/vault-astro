import {
  createDataviewIndex,
  resolveCurrentDataviewPage,
  type CreateDataviewIndexOptions,
} from "./dataview-index";
import { parseDataviewQuery } from "./dataview-expression-parser";
import { executeDataviewQuery } from "./dataview-query-executor";
import { renderDataviewError, renderDataviewResult } from "./dataview-renderer";
import type { DataviewIndex, FileContext } from "./dataview-types";

interface RenderDataviewQueryOptions extends CreateDataviewIndexOptions {
  index?: DataviewIndex;
}

export function renderDataviewQuery(
  source: string,
  file: FileContext,
  options?: RenderDataviewQueryOptions,
): string {
  const index = options?.index ?? createDataviewIndex(options);
  const currentPage = resolveCurrentDataviewPage(file, index, options?.contentRoot);

  try {
    const query = parseDataviewQuery(source);
    const result = executeDataviewQuery(query, currentPage, index);
    return renderDataviewResult(result);
  } catch (error) {
    return renderDataviewError(source, error);
  }
}
