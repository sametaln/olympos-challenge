import React, { useRef, useEffect, useState } from 'react'
import { CompanyData } from '../App';
import * as d3 from 'd3';

const WIDTH = 800;
const HEIGHT = 400;
const MARGIN = { TOP: 20, BOTTOM: 50, LEFT: 50, RIGHT: 20 };

const INNER_WIDTH = WIDTH - MARGIN.LEFT - MARGIN.RIGHT;
const INNER_HEIGHT = HEIGHT - MARGIN.TOP - MARGIN.BOTTOM;


function LineChart({ data }: { data: CompanyData[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [returnedJSX, setReturnedJSX] = useState<JSX.Element | null>(null);

    useEffect(() => {


        const xScale = d3.scalePoint()
            .domain(data[0].values.map(d => d.month))
            .range([0, INNER_WIDTH])


        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d3.max(d.values, d => d.totalFte)) as number])
            .range([INNER_HEIGHT, 0]);


        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

        const line = d3.line()
            .x((d: any) => xScale(d.month) as number)
            .y((d: any) => yScale(d.totalFte) as number)

        const xAxis = d3.axisBottom(xScale)
        const yAxis = d3.axisLeft(yScale)

        const svg = d3.select(svgRef.current)
            .attr('width', WIDTH)
            .attr('height', HEIGHT)

        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)

        const createLineChart = () => {
            const chart = svg.append('g')
                .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

            chart.selectAll('.line')
                .data(data)
                .enter()
                .append('path')
                .attr('class', 'line')
                .attr('d', (d: CompanyData) => line(d.values as any))
                .attr('fill', 'none')
                .attr('stroke', (d: CompanyData, i: number) => colorScale(i.toString()))
                .attr('stroke-width', 3)

            chart.selectAll('.dot')
                .data(data)
                .enter()
                .append('g')
                .attr('class', 'dot')
                .selectAll('circle')
                .data((d: CompanyData) => d.values)
                .enter()
                .append('circle')
                .attr('cx', (d: any) => xScale(d.month) as number)
                .attr('cy', (d: any) => yScale(d.totalFte) as number)
                .attr('r', 5)
                .attr('fill', 'black')
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .on('mouseover', (event: any, d: any,) => {
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9)
                    tooltip.html(`${d.month}: ${d.totalFte} for ${data.find((company: CompanyData) => company.values.find((companyData: any) => companyData.totalFte === d.totalFte))?.key
                        }`)
                        .style('left', `${event.pageX}px`)
                        .style('top', `${event.pageY - 28}px`)
                })
                .on('mouseout', () => {
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0)
                })

            chart.append('g')
                .attr('transform', `translate(0, ${INNER_HEIGHT})`)
                .call(xAxis)
                .attr('class', 'x-axis')
                .append('text')
                .attr('x', INNER_WIDTH / 2)
                .attr('y', MARGIN.BOTTOM - 10)
                .attr('fill', 'black')
                .text('Month')

            chart.append('g')
                .call(yAxis)
                .attr('class', 'y-axis')
                .append('text')
                .attr('class', 'y-axis-label')
                .attr('x', -INNER_HEIGHT / 2)
                .attr('y', -MARGIN.LEFT + 7)
                .attr('fill', 'black')
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90)')
                .text('Total FTE')

            const updateYAxis = (
                key: 'totalFte' | 'hireCount'
            ) => {
                const newYScale = yScale.copy().domain([0, d3.max(data, d => d3.max(d.values, d => d[key])) as number])
                chart.select('.y-axis')
                    .transition()
                    .duration(1000)
                    .call(yAxis.scale(newYScale) as any)

                chart.select('.y-axis-label')
                    .transition()
                    .duration(1000)
                    .text(key === 'totalFte' ? 'Total FTE' : 'Hire Count')

                line.y((d: any) => newYScale(d[key]))

                chart.selectAll('.line')
                    .transition()
                    .duration(1000)
                    .attr('d', (d: any) => line(d.values.map(
                        ({
                            month,
                            totalFte,
                            hireCount
                        }: {
                            month: string,
                            totalFte: number,
                            hireCount: number
                        }) => ({ month, [key]: key === 'totalFte' ? totalFte : hireCount })) as any));

                chart.selectAll('.dot')
                    .transition()
                    .duration(1000)
                    .selectAll('circle')
                    .attr('cy', (d: any) => newYScale(d[key]) as number)

                chart.selectAll('.dot')
                    .selectAll('circle')
                    .on('mouseover', (event: any, d: any,) => {
                        tooltip.transition()
                            .duration(200)
                            .style('opacity', .9)
                        tooltip.html(`
                            ${d.month}: ${d[key]} for ${data.find((company: CompanyData) => company.values.find((companyData: any) => companyData[key] === d[key]))?.key}
                        `)
                            .style('left', `${event.pageX}px`)
                            .style('top', `${event.pageY - 28}px`)
                    }
                    )






            }

            const onSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                updateYAxis(e.target.checked ? 'hireCount' : 'totalFte')
            }

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
            )
        }

        setReturnedJSX(createLineChart())
    }, [data])

    return (
        <div>{
            returnedJSX
        }</div>
    )
}

export default LineChart