import React, { useRef, useEffect, useState } from 'react';
import { CompanyData } from '../App';
import * as d3 from 'd3';
import {
    createScales,
    createLineGenerator,
    createAxes,
    renderChart,
    renderAxes,
    setupTooltip,
    updateYAxis
} from '../utils/utils';
import { WIDTH, HEIGHT } from '../constants/CONSTANTS';

function LineChart({ data }: { data: CompanyData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [returnedJSX, setReturnedJSX] = useState<JSX.Element | null>(null);

    useEffect(() => {
        const { xScale, yScale, colorScale } = createScales(data);
        const line = createLineGenerator(xScale, yScale);
        const { xAxis, yAxis } = createAxes(xScale, yScale);
        const svg = d3.select(svgRef.current)
            .attr('width', WIDTH)
            .attr('height', HEIGHT);

        const chart = renderChart(svg, data, line, xScale, yScale, colorScale);
        renderAxes(chart, xAxis, yAxis);
        setupTooltip(chart, data, xScale, yScale);

        const onSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            updateYAxis(chart, data, e.target.checked ? 'hireCount' : 'totalFte', yAxis, yScale, line);
        };

        setReturnedJSX(createJSX(onSwitchChange, svgRef));
    }, [data]);

    return (
        <div>
            {returnedJSX}
        </div>
    );
}

function createJSX(onSwitchChange: (e: React.ChangeEvent<HTMLInputElement>) => void, svgRef: React.RefObject<SVGSVGElement>) {
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    onChange={onSwitchChange}
                />
                Switch to hire count
            </label>
            <svg ref={svgRef}></svg>
        </div>
    );
}

export default LineChart;


