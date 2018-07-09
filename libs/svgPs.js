(function(root, factory){
    if(typeof define === 'function' && define.amd) {
        define(['d3'], factory)
    } else if(typeof module.exports === 'object') {
        module.exports = factory(require('d3'))
    } else {
        root.SvgPs = factory()
    }
}(this, function(d3) {
    let defaultOpts = {
        wrapperCls: '.canvasBoardWrapper',
        pencilCls: '.pencil',
        rectCls: '.rect',
        eraseCls: '.erase',
        rubbinCls: '.rubbin',
        undoCls: '.undo',
        eraserWidth: 30,
        eraserHeight: 30,
        svgWidth: '100%',
        svgHeight: '100%',
        pencilWidth: 3,
        pencilColor: 'red',
        drawBeginCallback: null,
        drawCallback: null,
        drawEndCallback: null
    }

    let SvgPs = function(options) {
        this.opts = Object.assign({}, defaultOpts, options)
        this.init()
    }

    SvgPs.prototype = {
        init(){
            this.initSvg()
            this.initEls()
            this.initEvents()
        },

        initSvg(){
            this.svgData = []
            this.svgDataGroup = []
            this.eraserWidth = this.opts.eraserWidth
            this.eraserHeight = this.opts.eraserHeight
            this.svg = d3.select(this.opts.wrapperCls).append('svg').attr('width', this.opts.svgWidth).attr('height', this.opts.svgHeight)    
        },

        initEls(){
            this.$wrapper = d3.select(this.opts.wrapperCls)
            this.$pencil = this.$wrapper.select(this.opts.pencilCls)
            this.$rect = this.$wrapper.select(this.opts.rectCls)
            this.$erase = this.$wrapper.select(this.opts.eraseCls)
            this.$rubbin = this.$wrapper.select(this.opts.rubbinCls)
            this.$undo = this.$wrapper.select(this.opts.undoCls)
        },
        
        initEvents(){
            this.$pencil.on('click', () => {
               this.resetEvents()
               this.initPencilEvent()
               this.resetSelectedSelection()
               this.$pencil.classed('selected', true)
            })

            this.$erase.on('click', () => {
                this.resetSelectedSelection()
                this.resetEvents()
                this.$erase.classed('selected', true)
                this.initEraserEvent()
            })

            this.$rect.on('click', () => {
                this.resetSelectedSelection()
                this.resetEvents()
                this.$rect.classed('selected', true)
                this.initRectEvents()
            })

            this.$rubbin.on('click', () => {
                this.resetSelectedSelection()
                this.resetEvents()
                this.rubbinCanvas()
            })

            this.$undo.on('click', () => {
                this.resetSelectedSelection()
                this.resetEvents()

                this.undo()
            })
            
        },

        resetSelectedSelection() {
            d3.select('.selected').classed('selected', false)
        },

        initPencilEvent() {
            this.svg.on('mousedown', () => {
                this.beginDrawLine()
            })

            this.svg.on('mousemove', () => {
                this.drawLine()
            })

            this.svg.on('mouseup', () => {
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

        initRectEvents() {
            this.svg.on('mousedown', () => {
                this.beginDrawRect()
            })
            this.svg.on('mousemove', () => {
                this.drawRect()
            })
            this.svg.on('mouseup', () => {
                this.endDrawRect()
            })
        },

        resetEvents() {
            this.svg.on('mousedown', null)
            this.svg.on('mousemove', null)
            this.svg.on('mouseup', null)
        },

        beginDrawLine(data) {
            this.svgGroup = this.svg.append('g')  
            this.svgDataGroup.push(this.svgGroup)

            this.svgData = []
            let pos = d3.event

            this.svgData.push([pos.offsetX, pos.offsetY])

            this.currentPath = this.svgGroup.selectAll('path').data(this.svgData).enter().append('path')
            this.beginDraw = true

            this.opts.drawBeginCallback && this.opts.drawBeginCallback('line', this.svgData)
        },

        drawLine(data) {
            if(!this.beginDraw) {return}

            let pos = d3.event
            this.svgData.push([pos.offsetX, pos.offsetY])
            
            let line = d3.line()

            line.x(function(d) {return d[0]}).y(function(d) {return d[1]})
            
            this.currentPath.attr('d', line(this.svgData)).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill','transparent')
            this.opts.drawCallback && this.opts.drawCallback('line', this.svgData)
        },

        endDrawLine() {
            this.beginDraw = false

            this.opts.drawEndCallback && this.opts.drawEndCallback('line', this.svgData)
        },

        initDrawLineBySocket(data) {
            this.svgGroup = this.svg.append('g')
            this.svgDataGroup.push(this.svgGroup)

            this.svgData = data
            this.currentPath = this.svgGroup.selectAll('path').data(this.svgData).enter().append('path')
        },

        drawLineBySocket(data) {
            this.svgData = data
            
            let line = d3.line()

            line.x(function(d) {return d[0]}).y(function(d) {return d[1]})
            
            this.currentPath && this.currentPath.attr('d', line(this.svgData)).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill','transparent')
        },

        beginDrawEraser() {
            this.eraserGroup = this.svg.append('g')

            this.svgDataGroup.push(this.eraserGroup)

            this.drawEraserByPos(true)

            this.beginDrawEraserSign = true

            this.opts.drawBeginCallback && this.opts.drawBeginCallback('eraser', this.svgData)
        },

        drawEraser() {
            if(!this.beginDrawEraserSign) {return}

            this.drawEraserByPos()
        },

        drawEraserByPos(begin) {
            if(begin) {
                this.svgData = []
            }
            
            let pos = d3.event
            let path = d3.path()

            path.rect(pos.offsetX - this.eraserWidth / 2, pos.offsetY - this.eraserHeight / 2, this.eraserWidth, this.eraserHeight)
            this.svgData.push(path._)

            this.eraserGroup.selectAll('path').data(this.svgData).enter().append('path').attr('d', function(d) {return d}).attr('fill', '#fff')
            this.opts.drawCallback && this.opts.drawCallback('eraser', this.svgData)
        },

        endDrawEraser() {
            this.beginDrawEraserSign = false

            this.opts.drawEndCallback && this.opts.drawEndCallback('eraser', this.svgData)
        },

        initDrawEraserBySocket(data) {
            this.eraserGroup = this.svg.append('g')
            this.svgDataGroup.push(this.eraserGroup)
            this.svgData = data
        },

        drawEraserBySocket(data) {
            this.svgData = data

            this.eraserGroup && this.eraserGroup.selectAll('path').data(this.svgData).enter().append('path').attr('d', function(d) {return d}).attr('fill', '#fff')
        },

        beginDrawRect() {
            this.rectGroup = this.svg.append('g')

            this.svgDataGroup.push(this.rectGroup)

            let pos = d3.event

            this.svgReactInitalPos = {x: pos.offsetX, y: pos.offsetY}
            this.svgData = [pos.offsetX, pos.offsetY, 0, 0]

            this.beginDrawRectSign = true

            this.opts.drawBeginCallback && this.opts.drawBeginCallback('rect', this.svgData)
        },

        drawRect() {
            if(!this.beginDrawRectSign) {return}

            let initialX = this.svgReactInitalPos.x
            let initialY = this.svgReactInitalPos.y
            let pos = d3.event
            let width = pos.offsetX - initialX
            let height = pos.offsetY - initialY

            let path = d3.path()

            path.rect(initialX, initialY, width, height)

            this.svgData = [path._]

            let update = this.rectGroup.selectAll('path').data(this.svgData)
            let enter = update.enter()

            enter.append('path').attr('d', function(d) {return d}).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill', 'transparent')
            update.attr('d', function(d) {return d}).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill', 'transparent')
            
            this.opts.drawCallback && this.opts.drawCallback('rect', this.svgData)
        },

        endDrawRect() {
            this.beginDrawRectSign = false

            this.opts.drawEndCallback && this.opts.drawEndCallback('rect', this.svgData)
        },

        initialDrawRectBySocket(data) {
            this.rectGroup = this.svg.append('g')

            this.svgDataGroup.push(this.rectGroup)
            this.svgData = data
        },

        drawRectBySocket(data) {
            this.svgData = data

            let update = this.rectGroup.selectAll('path').data(this.svgData)
            let enter = update.enter()

            enter.append('path').attr('d', function(d) {return d}).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill', 'transparent')
            update.attr('d', function(d) {return d}).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill', 'transparent')
        },

        rubbinCanvas() {
            this.svgDataGroup.forEach(group => {
                group.selectAll('path').data([]).exit().remove()
                group.remove()
            })

            this.svgData = []
            this.svgDataGroup = []

            this.opts.drawCallback && this.opts.drawCallback('empty')
        },

        undo() {
            this.lastSvgGroup = this.svgDataGroup.pop()

            this.lastSvgGroup.remove()

            this.svgData.pop()

            this.opts.drawCallback && this.opts.drawCallback('undo')
        },

        initDraw(type, data) {
            switch(type) {
                case 'line':
                    this.initDrawLineBySocket(data)
                    break;
                case 'rect':
                    this.initialDrawRectBySocket(data)
                    break;
                case 'eraser':
                    this.initDrawEraserBySocket(data)
                    break;
                default:
                    break;
            }
        },

        draw(type, data) {
            switch(type) {
                case 'line':
                    this.drawLineBySocket(data)
                    break;
                case 'rect':
                    this.drawRectBySocket(data)
                    break;
                case 'eraser':
                    this.drawEraserBySocket(data)
                    break;
                case 'empty':
                    this.rubbinCanvas()
                    break;
                case 'undo':
                    this.undo()
                    break;
                default:
                    break;
            }
        }
    }

    return SvgPs
}))