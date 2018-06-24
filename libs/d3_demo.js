let d3Demo = {
    drawCircle() {
        console.log('draw circle')
        this.svg.append('circle').attr('cx', '150px').attr('cy', '150px').attr('r', '50px').attr('fill', 'red')
    },

    drawHistogram() {
        let dataset = [20, 30, 44, 20, 55, 230, 120, 34]
        let padding = {top: 20, bottom: 20, left: 20, right: 20}
        let rectStep = 35
        let rectWidth = 30

        let rect = this.svg.selectAll('rect').
                    data(dataset).
                    enter().
                    append('rect').
                    attr('fill', 'blue').
                    attr('x', function(d, i) {
                        return padding.left + i * rectStep
                    }).
                    attr('y', function(d) {
                        return 400 - padding.bottom - d
                    }).
                    attr('width', rectWidth).
                    attr('height', function(d) {
                        return d
                    })

        let text = this.svg.selectAll('text').
                    data(dataset).
                    enter().
                    append('text').
                    attr('font-size', '14px').
                    attr('fill', 'white').
                    attr('text-anchor', 'middle').
                    attr('x', function(d, i) {
                        return padding.left + i * rectStep
                    }).
                    attr('y', function(d) {
                        return 400 - padding.bottom - d
                    }).
                    attr('dx', rectWidth/2).
                    attr('dy', '1em').
                    text(function(d) {
                        return d
                    })

    },

    drawAxis() {
        console.log(d3.scale)
        let xScale = d3.scaleLinear().domain([0, 10]).range([0, 300])

        let axis = d3.axisBottom().scale(xScale).ticks(5).tickFormat(d3.format('$0.1f'))

        let gAxis = this.svg.append('g').attr('transform', 'translate(80, 80)')

        axis(gAxis)
    },

    drawHistogramAxis() {
        let dataset = [20, 30, 44, 20, 55, 230, 120, 34]
        let padding = {top: 20, bottom: 20, left: 85, right: 20}
        let xAxisWidth = 300
        let yAxisWidth = 300

        let xScale = d3.scaleBand()
                    .domain(d3.range(dataset.length))
                    .range([0, xAxisWidth])

        let yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset)])
                    .range([0, yAxisWidth])

        let rect = this.svg.selectAll('rect').
                    data(dataset).
                    enter().
                    append('rect').
                    attr('fill', 'blue').
                    attr('x', function(d, i) {
                        return padding.left + xScale(i)
                    }).
                    attr('y', function(d) {
                        return 400 - padding.bottom - yScale(d)
                    }).
                    attr('width',  xScale.bandwidth() - 10).
                    attr('height', function(d) {
                        return yScale(d)
                    })
                    .on('mouseover', function(d, i) {
                        d3.select(this).attr('fill', 'red')
                    })
                    .on('mouseout', function(d, i) {
                        d3.select(this).transition().duration(1000).attr('fill', 'blue')
                    })
        let text = this.svg.selectAll('text').
                    data(dataset).
                    enter().
                    append('text').
                    attr('font-size', '14px').
                    attr('fill', 'white').
                    attr('text-anchor', 'middle').
                    attr('x', function(d, i) {
                        return padding.left + xScale(i)
                    }).
                    attr('y', function(d) {
                        return 400 - padding.bottom - yScale(d)
                    }).
                    attr('dx', (xScale.bandwidth() - 10)/2).
                    attr('dy', '1em').
                    text(function(d) {
                        return d
                    })

        let xAxis = d3.axisBottom().scale(xScale)

        yScale.range([yAxisWidth, 0])

        let yAxis = d3.axisLeft().scale(yScale)

        this.svg.append('g').attr('transform', 'translate(80, ' + 380 +')').attr('class', 'axis').call(xAxis)
        this.svg.append('g').attr('transform', 'translate(80, 80)').call(yAxis)

        

    },

    firstTransition() {
        this.svg.append('rect').attr('x', 80).attr('y', 80)
                .attr('width', 100).attr('height', 30)
                .transition().delay(500).duration(1000)
                .ease(d3.easeBounce).attr('width', 300)
    }
}