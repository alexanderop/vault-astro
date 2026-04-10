import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData } from "@/features/graph/lib/graph-data-builder";
import ForceGraph from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";
import { Maximize, Minimize, Minus, Plus, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ForceGraphViewProps {
  graphData: GraphData;
}

interface FGNode {
  id: string;
  title: string;
  degree: number;
  x?: number;
  y?: number;
}

interface FGLink {
  source: string | FGNode;
  target: string | FGNode;
}

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue("--palette-accent").trim();
  const base = style.getPropertyValue("--palette-base").trim();
  const isDark = document.documentElement.classList.contains("dark");

  return {
    node: accent,
    nodeHover: isDark ? "oklch(0.85 0.14 280)" : "oklch(0.5 0.16 235)",
    nodeDimmed: isDark ? "oklch(0.35 0.03 260)" : "oklch(0.75 0.03 95)",
    link: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    linkHover: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
    text: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
    textDimmed: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
    bg: base,
    isDark,
  };
}

/** Map degree count → node radius */
function nodeRadius(degree: number): number {
  if (degree <= 1) return 2.5;
  if (degree <= 3) return 3.5;
  if (degree <= 6) return 5;
  if (degree <= 10) return 6.5;
  return 8;
}

export function ForceGraphView({ graphData }: ForceGraphViewProps) {
  const ref = useRef<ForceGraphMethods<FGNode, FGLink>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const colorsRef = useRef(typeof document !== "undefined" ? getThemeColors() : null);

  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const edge of graphData.edges) {
      map.set(edge.source, (map.get(edge.source) ?? 0) + 1);
      map.set(edge.target, (map.get(edge.target) ?? 0) + 1);
    }
    return map;
  }, [graphData.edges]);

  const fgData = useMemo(
    () => ({
      nodes: graphData.nodes.map((n) => ({
        ...n,
        degree: degreeMap.get(n.id) ?? 0,
      })),
      links: graphData.edges.map((e) => ({ source: e.source, target: e.target })),
    }),
    [graphData, degreeMap],
  );

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
  }, [dimensions]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    if (!ref.current) return;
    ref.current.d3Force("charge")?.strength(-60);
    ref.current.d3Force("link")?.distance(45).strength(0.2);
    ref.current.d3ReheatSimulation();
  }, []);

  const handleEngineStop = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ref.current is mutable
    ref.current?.zoomToFit(400, 60);
  }, []);

  const connectedNodes = useRef(new Map<string, Set<string>>());
  useEffect(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of graphData.edges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.source)!.add(edge.target);
      map.get(edge.target)!.add(edge.source);
    }
    connectedNodes.current = map;
  }, [graphData.edges]);

  const isConnected = useCallback(
    (nodeId: string) => {
      if (!hoveredNode) return false;
      if (nodeId === hoveredNode) return true;
      return connectedNodes.current.get(hoveredNode)?.has(nodeId) ?? false;
    },
    [hoveredNode],
  );

  const linkColor = useCallback(
    (link: FGLink) => {
      const colors = colorsRef.current ?? getThemeColors();
      if (!hoveredNode) return colors.link;
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      return sourceId === hoveredNode || targetId === hoveredNode ? colors.linkHover : colors.link;
    },
    [hoveredNode],
  );

  const linkWidth = useCallback(
    (link: FGLink) => {
      if (!hoveredNode) return 0.5;
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      return sourceId === hoveredNode || targetId === hoveredNode ? 1.2 : 0.3;
    },
    [hoveredNode],
  );

  const nodeCanvasObject = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const colors = colorsRef.current ?? getThemeColors();
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = nodeRadius(node.degree);
      const isActive = node.id === hoveredNode;
      const isHighlighted = isConnected(node.id);
      const isDimmed = hoveredNode !== null && !isHighlighted;

      // Outer glow for hovered node
      if (isActive) {
        const glowR = r * 3;
        const gradient = ctx.createRadialGradient(x, y, r, x, y, glowR);
        gradient.addColorStop(0, colors.isDark ? "rgba(140,120,255,0.2)" : "rgba(80,80,200,0.12)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Node circle
      const drawR = isActive ? r * 1.4 : r;
      ctx.beginPath();
      ctx.arc(x, y, drawR, 0, 2 * Math.PI);

      if (isDimmed) {
        ctx.fillStyle = colors.nodeDimmed;
      } else if (isActive || isHighlighted) {
        ctx.fillStyle = colors.nodeHover;
      } else {
        ctx.fillStyle = colors.node;
      }
      ctx.fill();

      // Subtle ring on highlighted neighbors
      if (isHighlighted && !isActive) {
        ctx.strokeStyle = colors.nodeHover;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Labels: always for hubs, on hover for connected, at zoom for rest
      const showLabel =
        isActive ||
        (isHighlighted && globalScale > 1.2) ||
        (!hoveredNode && node.degree >= 5 && globalScale > 0.8) ||
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
    [hoveredNode, isConnected],
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

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${isFullscreen ? "bg-background" : ""}`}
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
        linkCurvature={0.12}
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
