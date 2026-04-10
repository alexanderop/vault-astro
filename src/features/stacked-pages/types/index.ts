export interface StackedPane {
  slug: string;
  title: string;
  htmlContent: string;
  headerHtml: string;
}

export interface StackState {
  panes: StackedPane[];
  focusedIndex: number;
}
