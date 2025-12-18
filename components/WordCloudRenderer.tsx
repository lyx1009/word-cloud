import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WordData, CloudConfig } from '../types';
import { COLORS } from '../constants';

// Declare global d3-cloud type since we load it via CDN
declare global {
  interface Window {
    d3: any;
  }
}

interface WordCloudRendererProps {
  data: WordData[];
  config: CloudConfig;
  width: number;
  height: number;
}

const WordCloudRenderer: React.FC<WordCloudRendererProps> = ({ data, config, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    setIsGenerating(true);

    // Clean up previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Scale for font size
    const minValue = d3.min(data, d => d.value) || 1;
    const maxValue = d3.max(data, d => d.value) || 10;
    
    const fontScale = config.scale === 'log' 
      ? d3.scaleLog().domain([minValue, maxValue]).range([14, 80])
      : d3.scaleLinear().domain([minValue, maxValue]).range([14, 80]);

    // Color scale
    const colorScale = d3.scaleOrdinal(COLORS);

    // Layout configuration
    const layout = (window as any).d3.layout.cloud()
      .size([width, height])
      .words(data.map(d => ({ text: d.text, size: fontScale(d.value), originalValue: d.value })))
      .padding(config.padding)
      .rotate(() => {
        // If rotations is 0, use the first angle as fixed orientation
        if (config.rotations === 0) return config.rotationAngles[0];
        
        const range = config.rotationAngles[1] - config.rotationAngles[0];
        if (range === 0) return config.rotationAngles[0];

        const step = range / (config.rotations - 1 || 1);
        const randomStep = Math.floor(Math.random() * config.rotations);
        return config.rotationAngles[0] + (randomStep * step);
      })
      .font(config.fontFamily)
      .fontSize((d: any) => d.size)
      .spiral(config.spiral)
      .on("end", draw);

    layout.start();

    function draw(words: any[]) {
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const text = svg.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", (d: any) => `${d.size}px`)
        .style("font-family", config.fontFamily)
        .style("fill", (_: any, i: number) => colorScale(i.toString()))
        .attr("text-anchor", "middle")
        .attr("transform", (d: any) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d: any) => d.text)
        .style("opacity", 0)
        .style("cursor", "default")
        .on("mouseover", function(event: any, d: any) {
           d3.select(this).transition().duration(200).style("opacity", 1).style("font-weight", "bold");
        })
        .on("mouseout", function(event: any, d: any) {
           d3.select(this).transition().duration(200).style("font-weight", "normal");
        });

      // Simple enter animation
      text.transition()
        .duration(600)
        .delay((_: any, i: number) => i * 5)
        .style("opacity", 0.9);
        
      setIsGenerating(false);
    }

  }, [data, config, width, height]);

  return (
    <div className="relative flex items-center justify-center bg-surface rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-primary font-medium">排版计算中...</span>
          </div>
        </div>
      )}
      <svg ref={svgRef} className="w-full h-full max-w-full" />
    </div>
  );
};

export default WordCloudRenderer;