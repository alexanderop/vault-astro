import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CLUSTER_OTHER,
  type GraphData,
  type GraphNodeKind,
} from "@/features/graph/lib/graph-data-builder";
import ForceGraph from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";
import {
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  Minus,
  Plus,
  SearchIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ForceGraphViewProps {
  graphData: GraphData;
}

interface FGNode {
  id: string;
  title: string;
  cluster: string;
  kind: GraphNodeKind;
  degree: number;
  x?: number;
  y?: number;
}

interface FGLink {
  source: string | FGNode;
  target: string | FGNode;
}

const CLUSTER_SLOT_COUNT = 10;

interface ThemeColors {
  nodeHover: string;
  nodeDimmed: string;
  link: string;
  linkHover: string;
  text: string;
  textDimmed: string;
  bg: string;
  clusters: Record<string, string>;
  isDark: boolean;
}

function getThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  const base = style.getPropertyValue("--palette-base").trim();
  const isDark = document.documentElement.classList.contains("dark");

  const clusters: Record<string, string> = {};
  for (let i = 1; i <= CLUSTER_SLOT_COUNT; i++) {
    clusters[`c${i}`] = style.getPropertyValue(`--graph-cluster-${i}`).trim();
  }
  clusters[CLUSTER_OTHER] = style.getPropertyValue("--graph-cluster-other").trim();

  return {
    nodeHover: isDark ? "oklch(0.92 0.05 280)" : "oklch(0.4 0.16 235)",
    nodeDimmed: isDark ? "oklch(0.24 0.01 260)" : "oklch(0.88 0.01 95)",
    link: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    linkHover: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)",
    text: isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.72)",
    textDimmed: isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.28)",
    bg: base,
    clusters,
    isDark,
  };
}

function nodeRadius(degree: number): number {
  return Math.min(10, 2 + Math.sqrt(degree) * 1.2);
}

function FilterChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2 py-0.5 text-ui-xs shadow-sm backdrop-blur transition-colors",
        active
          ? "border-ring bg-primary/15 text-foreground"
          : "border-border bg-background/85 text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function ForceGraphView({ graphData }: ForceGraphViewProps) {
  const ref = useRef<ForceGraphMethods<FGNode, FGLink>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [legendOpen, setLegendOpen] = useState(true);
  const userToggledLegend = useRef(false);
  const [showAuthors, setShowAuthors] = useState(false);
  const [showCatalogs, setShowCatalogs] = useState(false);
  const [activeClusters, setActiveClusters] = useState<Set<string>>(() => new Set());

  const toggleCluster = useCallback((tag: string) => {
    setActiveClusters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }, []);
  const colorsRef = useRef<ThemeColors | null>(
    typeof document !== "undefined" ? getThemeColors() : null,
  );
  const [, setColorTick] = useState(0);

  const visibleNodes = useMemo(() => {
    return graphData.nodes.filter((n) => {
      if (n.kind === "author" && !showAuthors) return false;
      if (n.kind === "catalog" && !showCatalogs) return false;
      return true;
    });
  }, [graphData.nodes, showAuthors, showCatalogs]);

  const visibleEdges = useMemo(() => {
    const ids = new Set(visibleNodes.map((n) => n.id));
    return graphData.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
  }, [visibleNodes, graphData.edges]);

  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const edge of visibleEdges) {
      map.set(edge.source, (map.get(edge.source) ?? 0) + 1);
      map.set(edge.target, (map.get(edge.target) ?? 0) + 1);
    }
    return map;
  }, [visibleEdges]);

  const fgData = useMemo(
    () => ({
      nodes: visibleNodes.map((n) => ({
        ...n,
        degree: degreeMap.get(n.id) ?? 0,
      })),
      links: visibleEdges.map((e) => ({ source: e.source, target: e.target })),
    }),
    [visibleNodes, visibleEdges, degreeMap],
  );

  /** Stable cluster → slot mapping driven by global topTags order (deterministic across pages). */
  const clusterSlot = useMemo(() => {
    const map = new Map<string, string>();
    graphData.topTags.slice(0, CLUSTER_SLOT_COUNT).forEach((tag, i) => {
      map.set(tag, `c${i + 1}`);
    });
    map.set(CLUSTER_OTHER, CLUSTER_OTHER);
    return map;
  }, [graphData.topTags]);

  /** Legend entries = top tags that are actually present in this view, keeping global slot assignment. */
  const legendEntries = useMemo(() => {
    const present = new Set(fgData.nodes.map((n) => n.cluster));
    return graphData.topTags
      .slice(0, CLUSTER_SLOT_COUNT)
      .filter((tag) => present.has(tag))
      .map((tag, i) => ({ tag, slot: `c${graphData.topTags.indexOf(tag) + 1}`, _i: i }));
  }, [graphData.topTags, fgData.nodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ResizeObserver entries can be empty
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      colorsRef.current = getThemeColors();
      setColorTick((v) => v + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    if (ref.current) {
      ref.current.zoomToFit(400, 60);
    }
  }, [dimensions, fgData.nodes.length]);

  useEffect(() => {
    if (userToggledLegend.current) return;
    setLegendOpen(dimensions.width >= 480);
  }, [dimensions.width]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    if (!ref.current) return;
    ref.current.d3Force("charge")?.strength((n: FGNode) => -70 - Math.min(80, (n.degree ?? 0) * 4));
    ref.current.d3Force("link")?.distance(50).strength(0.25);
    ref.current.d3ReheatSimulation();
  }, [showAuthors, showCatalogs]);

  const handleEngineStop = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    ref.current?.zoomToFit(400, 60);
  }, []);

  const connectedNodes = useRef(new Map<string, Set<string>>());
  useEffect(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of visibleEdges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.source)!.add(edge.target);
      map.get(edge.target)!.add(edge.source);
    }
    connectedNodes.current = map;
  }, [visibleEdges]);

  const isConnected = useCallback(
    (nodeId: string) => {
      if (!hoveredNode) return false;
      if (nodeId === hoveredNode) return true;
      return connectedNodes.current.get(hoveredNode)?.has(nodeId) ?? false;
    },
    [hoveredNode],
  );

  const matchedIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set<string>();
    for (const node of fgData.nodes) {
      if (node.title.toLowerCase().includes(q)) ids.add(node.id);
    }
    return ids;
  }, [query, fgData.nodes]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    if (!ref.current || !matchedIds || matchedIds.size !== 1) return;
    const [id] = matchedIds;
    const node = fgData.nodes.find((n) => n.id === id) as FGNode | undefined;
    if (node?.x != null && node.y != null) {
      ref.current.centerAt(node.x, node.y, 600);
      ref.current.zoom(4, 600);
    }
  }, [matchedIds, fgData.nodes]);

  const nodeClusterMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of fgData.nodes) map.set(n.id, n.cluster);
    return map;
  }, [fgData.nodes]);

  const nodePassesCluster = useCallback(
    (nodeId: string) => {
      if (activeClusters.size === 0) return true;
      const cluster = nodeClusterMap.get(nodeId);
      return cluster !== undefined && activeClusters.has(cluster);
    },
    [activeClusters, nodeClusterMap],
  );

  const isLinkActive = useCallback(
    (link: FGLink): "hover" | "match" | "cluster" | "none" => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      if (hoveredNode && (sourceId === hoveredNode || targetId === hoveredNode)) return "hover";
      if (matchedIds && matchedIds.has(sourceId) && matchedIds.has(targetId)) return "match";
      if (activeClusters.size > 0 && nodePassesCluster(sourceId) && nodePassesCluster(targetId))
        return "cluster";
      return "none";
    },
    [hoveredNode, matchedIds, activeClusters, nodePassesCluster],
  );

  const linkColor = useCallback(
    (link: FGLink) => {
      const colors = colorsRef.current ?? getThemeColors();
      if (!hoveredNode && !matchedIds && activeClusters.size === 0) return colors.link;
      return isLinkActive(link) === "none" ? colors.link : colors.linkHover;
    },
    [hoveredNode, matchedIds, activeClusters, isLinkActive],
  );

  const linkWidth = useCallback(
    (link: FGLink) => {
      if (!hoveredNode && !matchedIds && activeClusters.size === 0) return 0.5;
      return isLinkActive(link) === "none" ? 0.3 : 1.2;
    },
    [hoveredNode, matchedIds, activeClusters, isLinkActive],
  );

  const nodeCanvasObject = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const colors = colorsRef.current ?? getThemeColors();
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = nodeRadius(node.degree);
      const isActive = node.id === hoveredNode;
      const isHighlighted = isConnected(node.id);
      const isSearchMiss = matchedIds !== null && !matchedIds.has(node.id);
      const isClusterMiss = activeClusters.size > 0 && !activeClusters.has(node.cluster);
      const isDimmed = isSearchMiss || isClusterMiss || (hoveredNode !== null && !isHighlighted);
      const slot = clusterSlot.get(node.cluster) ?? CLUSTER_OTHER;
      const baseColor = colors.clusters[slot] ?? colors.clusters[CLUSTER_OTHER];

      if (isActive) {
        const glowR = r * 3;
        const gradient = ctx.createRadialGradient(x, y, r, x, y, glowR);
        gradient.addColorStop(0, colors.isDark ? "rgba(180,160,255,0.22)" : "rgba(80,80,200,0.14)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      const drawR = isActive ? r * 1.4 : r;
      ctx.beginPath();
      ctx.arc(x, y, drawR, 0, 2 * Math.PI);

      if (isDimmed) {
        ctx.fillStyle = colors.nodeDimmed;
      } else if (isActive) {
        ctx.fillStyle = colors.nodeHover;
      } else {
        ctx.fillStyle = baseColor;
      }
      ctx.fill();

      if (isHighlighted && !isActive) {
        ctx.strokeStyle = colors.nodeHover;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      const isExactMatch = matchedIds?.has(node.id) ?? false;
      const showLabel =
        isActive ||
        (isHighlighted && globalScale > 1.2) ||
        (isExactMatch && matchedIds!.size <= 6) ||
        (!hoveredNode && !matchedIds && node.degree >= 5 && globalScale > 0.8) ||
        globalScale > 3;

      if (showLabel && node.title) {
        const fontSize = Math.min(Math.max(11 / globalScale, 2), 6);
        ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDimmed ? colors.textDimmed : colors.text;
        ctx.fillText(node.title, x, y + drawR + 1.5);
      }
    },
    [hoveredNode, isConnected, matchedIds, clusterSlot, activeClusters],
  );

  const handleNodeClick = useCallback((node: FGNode) => {
    window.location.href = `/${node.id}`;
  }, []);

  const handleZoom = useCallback((delta: number) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    if (!ref.current) return;
    const currentZoom = ref.current.zoom();
    ref.current.zoom(currentZoom * delta, 300);
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current.requestFullscreen();
    }
  }, []);

  const handleZoomToFit = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    ref.current?.zoomToFit(400, 60);
  }, []);

  const clusterColors = colorsRef.current?.clusters ?? {};

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full", isFullscreen && "bg-background")}
    >
      <ForceGraph
        ref={ref}
        graphData={fgData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        nodeId="id"
        nodeLabel=""
        nodeCanvasObjectMode={() => "replace"}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkCurvature={0.08}
        onNodeClick={handleNodeClick}
        onEngineStop={handleEngineStop}
        onNodeHover={(node) => {
          setHoveredNode(node?.id ?? null);
          const canvas = containerRef.current?.querySelector("canvas");
          if (canvas) canvas.style.cursor = node ? "pointer" : "default";
        }}
        enableNodeDrag={false}
        warmupTicks={100}
        cooldownTicks={100}
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.3}
        minZoom={0.5}
        maxZoom={8}
      />

      <div
        className="pointer-events-auto absolute left-3 top-3 z-50 flex flex-col gap-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-48 rounded-md border border-border bg-background/85 py-1 pl-7 pr-7 text-ui-sm shadow-sm backdrop-blur placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-surface-hover"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        {matchedIds && matchedIds.size === 0 && (
          <span className="rounded-md bg-background/85 px-2 py-0.5 text-ui-xs text-muted-foreground shadow-sm backdrop-blur">
            No matches
          </span>
        )}
        <div className="flex gap-1">
          <FilterChip
            label="Authors"
            active={showAuthors}
            onToggle={() => setShowAuthors((v) => !v)}
          />
          <FilterChip
            label="Catalogs"
            active={showCatalogs}
            onToggle={() => setShowCatalogs((v) => !v)}
          />
        </div>
      </div>

      {legendEntries.length > 0 && (
        <div
          className="pointer-events-auto absolute right-3 top-3 z-50 max-w-44 rounded-md border border-border bg-background/85 text-ui-xs shadow-sm backdrop-blur"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              userToggledLegend.current = true;
              setLegendOpen((v) => !v);
            }}
            className="flex w-full items-center justify-between gap-2 px-2 py-1 font-medium text-muted-foreground hover:text-foreground"
            aria-expanded={legendOpen}
          >
            <span className="flex items-center gap-1.5">
              Clusters
              {activeClusters.size > 0 && (
                <span className="rounded bg-primary/20 px-1 tabular-nums text-foreground">
                  {activeClusters.size}
                </span>
              )}
            </span>
            {legendOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
          {legendOpen && (
            <div className="border-t border-border px-1 py-1">
              {legendEntries.map(({ tag, slot }) => {
                const isActive = activeClusters.has(tag);
                const isMuted = activeClusters.size > 0 && !isActive;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleCluster(tag)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left transition-colors",
                      isActive
                        ? "bg-primary/15 text-foreground"
                        : isMuted
                          ? "text-muted-foreground hover:bg-surface-hover"
                          : "text-foreground/80 hover:bg-surface-hover",
                    )}
                  >
                    <span
                      className={cn("size-2.5 shrink-0 rounded-full", isMuted && "opacity-40")}
                      style={{ backgroundColor: clusterColors[slot] ?? "currentColor" }}
                      aria-hidden
                    />
                    <span className="truncate">{tag}</span>
                  </button>
                );
              })}
              {activeClusters.size > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveClusters(new Set())}
                  className="mt-0.5 w-full rounded px-1.5 py-0.5 text-left text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div
        className="pointer-events-auto absolute bottom-3 right-3 z-50 flex flex-col gap-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => handleZoom(1.5)}
          aria-label="Zoom in"
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => handleZoom(1 / 1.5)}
          aria-label="Zoom out"
        >
          <Minus className="size-3.5" />
        </Button>
        <Button variant="outline" size="icon-xs" onClick={handleZoomToFit} aria-label="Zoom to fit">
          <SearchIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
        </Button>
      </div>
    </div>
  );
}
