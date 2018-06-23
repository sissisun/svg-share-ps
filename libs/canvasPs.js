(function(root, factory){
    if(typeof define === 'function' && define.amd) {
        define(['d3'], factory)
    } else if(typeof module.exports === 'object') {
        console.log(222222)
        module.exports = factory(require('d3'))
    } else {
        root.factory = factory()
    }
}(this, function(d3) {
    let defaultOpts = {}

    let CanvasPs = function(options) {
        this.opts = Object.assign({}, defaultOpts, options)
        this.init()
    }

    CanvasPs.prototype = {
        init(){
            this.initSvg()
            this.initEls()
            this.initEvents()
        },

        initSvg(){
            this.svgData = []
            this.svgDataGroup = []
            this.svgEraserData = []
            this.svgEraserDataGroup = []
            this.eraserWidth = 30
            this.eraserHeight = 30
            this.svg = d3.select('.canvasBoard').append('svg').attr('width', '100%').attr('height', '100%')    
        },

        initEls(){
            this.$wheelBtns = d3.select('.wheelBtn')
            this.$pencil = d3.select('.pencil')
            this.$rect = d3.select('.rect')
            this.$erase = d3.select('.erase')
            this.$rubbin = d3.select('.rubbin')
        },
        
        initEvents(){
            this.$pencil.on('click', () => {
               // this.drawCircle()
                //this.drawHistogram()
                //this.drawAxis()
               // this.drawHistogramAxis()
               //this.firstTransition()
               this.resetPencilEvents()
               this.initPencilEvent()
               this.resetSelectedSelection()
               this.$pencil.classed('selected', true)
            })

            this.$erase.on('click', () => {
                

                this.resetSelectedSelection()
                this.resetPencilEvents()
                this.$erase.classed('selected', true)
                this.initEraserEvent()
            })

            this.$rubbin.on('click', () => {
                

                this.resetSelectedSelection()
                this.resetPencilEvents()
                //this.$rubbin.classed('selected', true)
                this.rubbinCanvas()
            })
            
        },

        resetSelectedSelection() {
            d3.select('.selected').classed('selected', false)
        },

        initPencilEvent() {
            this.svg.on('mousedown', () => {
                console.log(222222)
                console.log(d3.event)
                this.beginDrawLine()
            })

            this.svg.on('mousemove', () => {
                console.log('mousemove')
                this.drawLine()
            })

            this.svg.on('mouseup', () => {
                console.log('mouseup')
                this.endDrawLine()
            })
        },

        initEraserEvent() {
            this.svg.on('mousedown', () => {
                this.beginDrawEraser()
            })

            this.svg.on('mousemove', () => {
                this.drawEraser()
            })

            this.svg.on('mouseup', () => {
                this.endDrawEraser()
            })
        },

        resetPencilEvents() {
            this.svg.on('mosuedown', null)
            this.svg.on('mousemove', null)
            this.svg.on('mouseup', null)
        },

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
        },

        beginDrawLine() {
            this.svgGroup = this.svg.append('g')  
            this.svgDataGroup.push(this.svgGroup)
            let currentIndex = this.svgData.length
            this.svgData[currentIndex] = []
            let pos = d3.event

            this.svgData[currentIndex].push([pos.offsetX, pos.offsetY])

            this.currentPath = this.svgGroup.selectAll('path').data(this.svgData[currentIndex]).enter().append('path')
            this.beginDraw = true
        },

        drawLine() {
            if(!this.beginDraw) {return}
            let pos = d3.event
            let currentIndex = this.svgData.length - 1
            this.svgData[currentIndex].push([pos.offsetX, pos.offsetY])
            let line = d3.line()

            line.x(function(d) {return d[0]}).y(function(d) {return d[1]})

            this.currentPath.attr('d', line(this.svgData[currentIndex])).attr('stroke', 'red').attr('stroke-width', 3).attr('fill','transparent')
            
            
        },

        endDrawLine() {
            this.beginDraw = false
        },

        beginDrawEraser() {
            this.eraserGroup = this.svg.append('g')

            this.svgEraserDataGroup.push(this.eraserGroup)

            this.drawEraserByPos(true)

            this.beginDrawEraserSign = true
        },

        drawEraser() {
            console.log(this.beginDrawEraser)
            if(!this.beginDrawEraserSign) {return}

            this.drawEraserByPos()
        },

        drawEraserByPos(begin) {
            let currentIndex = begin ? this.svgEraserData.length : this.svgEraserData.length - 1
            if(begin) {
                this.svgEraserData[currentIndex] = []
            }
            let pos = d3.event
            let path = d3.path()

            path.rect(pos.offsetX - this.eraserWidth / 2, pos.offsetY - this.eraserHeight / 2, this.eraserWidth, this.eraserHeight)
            this.svgEraserData[currentIndex].push(path)

            this.eraserGroup.selectAll('path').data(this.svgEraserData[currentIndex]).enter().append('path').attr('d', function(d) {return d}).attr('fill', '#fff')
        },

        endDrawEraser() {
            this.beginDrawEraserSign = false
        },

        rubbinCanvas() {

            this.svgDataGroup.forEach((group, index) => {
                group.selectAll('path').data([]).exit().remove()
                group.remove()
            })
            this.svgEraserDataGroup.forEach((group, index) => {
                group.selectAll('path').data([]).exit().remove()
                group.remove()
            })
        },
    }

    return CanvasPs
}))