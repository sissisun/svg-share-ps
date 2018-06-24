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
        eraserWidth: 30,
        eraserHeight: 30,
        svgWidth: '100%',
        svgHeight: '100%',
        pencilWidth: 3,
        pencilColor: 'red'
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
            this.svgEraserData = []
            this.svgEraserDataGroup = []
            this.svgRectData = []
            this.svgRectDataGroup = []
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

            this.currentPath.attr('d', line(this.svgData[currentIndex])).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill','transparent')
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

        beginDrawRect() {
            this.rectGroup = this.svg.append('g')

            this.svgRectDataGroup.push(this.rectGroup)

            let pos = d3.event

            this.svgReactInitalPos = {x: pos.offsetX, y: pos.offsetY}
            this.svgRectData = [pos.offsetX, pos.offsetY, 0, 0]

            this.beginDrawRectSign = true
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

            this.svgRectData = [path]

            let update = this.rectGroup.selectAll('path').data(this.svgRectData)
            let enter = update.enter()

            enter.append('path').attr('d', function(d) {return d}).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill', 'transparent')
            update.attr('d', function(d) {return d}).attr('stroke', this.opts.pencilColor).attr('stroke-width', this.opts.pencilWidth).attr('fill', 'transparent')
        },

        endDrawRect() {
            this.beginDrawRectSign = false
        },

        rubbinCanvas() {

            this.svgDataGroup.concat(this.svgEraserDataGroup).concat(this.svgRectDataGroup).forEach((group, index) => {
                group.selectAll('path').data([]).exit().remove()
                group.remove()
            })
        }
    }

    return SvgPs
}))