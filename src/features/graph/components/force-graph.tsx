import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData } from "@/features/graph/lib/graph-data-builder";
import ForceGraph from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";

interface ForceGraphViewProps {
  graphData: GraphData;
}

interface FGNode {
  id: string;
  title: string;
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
  const text = style.getPropertyValue("--palette-text").trim();
  const base = style.getPropertyValue("--palette-base").trim();
  const isDark = document.documentElement.classList.contains("dark");

  return {
    node: accent,
    nodeHover: isDark ? "oklch(0.85 0.14 280)" : "oklch(0.5 0.16 235)",
    link: `color-mix(in oklab, ${text} 10%, transparent)`,
    linkHover: `color-mix(in oklab, ${text} 35%, transparent)`,
    text,
    bg: base,
  };
}

export function ForceGraphView({ graphData }: ForceGraphViewProps) {
  const ref = useRef<ForceGraphMethods<FGNode, FGLink>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const colorsRef = useRef(typeof document !== "undefined" ? getThemeColors() : null);

  const fgData = useMemo(
    () => ({
      nodes: graphData.nodes.map((n) => ({ ...n })),
      links: graphData.edges.map((e) => ({ source: e.source, target: e.target })),
    }),
    [graphData],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
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
    if (ref.current) {
      ref.current.zoomToFit(400, 50);
    }
  }, [dimensions]);

  // Configure d3 forces for better layout with many nodes
  useEffect(() => {
    if (!ref.current) return;
    ref.current.d3Force("charge")?.strength(-30);
    ref.current.d3Force("link")?.distance(30).strength(0.3);
    ref.current.d3ReheatSimulation();
  }, []);

  const handleEngineStop = useCallback(() => {
    ref.current?.zoomToFit(400, 50);
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

  const nodeColor = useCallback(
    (node: FGNode) => {
      const colors = colorsRef.current ?? getThemeColors();
      if (!hoveredNode) return colors.node;
      return isConnected(node.id) ? colors.nodeHover : colors.link;
    },
    [hoveredNode, isConnected],
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

  const nodeCanvasObject = useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const colors = colorsRef.current ?? getThemeColors();
      const size = 4;
      const isHighlighted = isConnected(node.id);
      const isActive = node.id === hoveredNode;

      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, isActive ? size * 1.5 : size, 0, 2 * Math.PI);
      ctx.fillStyle = !hoveredNode ? colors.node : isHighlighted ? colors.nodeHover : colors.link;
      ctx.fill();

      if ((isActive || (isHighlighted && globalScale > 1.5)) && node.title) {
        const fontSize = Math.max(10 / globalScale, 2);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = colors.text;
        ctx.fillText(node.title, node.x ?? 0, (node.y ?? 0) + size + 2);
      }
    },
    [hoveredNode, isConnected],
  );

  const handleNodeClick = useCallback((node: FGNode) => {
    window.location.href = `/${node.id}`;
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
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
        nodeColor={nodeColor}
        linkColor={linkColor}
        linkWidth={0.3}
        linkCurvature={0.15}
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
    </div>
  );
}
