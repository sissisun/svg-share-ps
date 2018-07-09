import '../styles/index.scss'
import SvgPs from '../../libs/svgPs'
import io from 'socket.io-client'

var Home = {
    init() {
        this.initAttrs()
        this.initSvgps()
        this.initSocket()
    },

    initAttrs() {
        this.role = this.getUrlQuerys('role')
        this.socket = null
        this.firstSvgPage = {}
    },

    initSocket() {
        let socket = io('http://localhost:8006' + '?role=' + this.role)
        this.socket = socket

        socket.on('connect', () => {
            console.log('connected')
        })

        socket.on('teacherDrawBeign', (data) => {
            if(this.role === 'student'){
                this.firstSvgPage.initDraw(data.type, data.data)
            }
        })

        socket.on('teacherDraw', (data) => {
            if(this.role === 'student'){
                this.firstSvgPage.draw(data.type, data.data)
            }
        })

        socket.on('disconnect', () => {
            console.log('disconnect')
        })
    },

    closeSocket() {
        this.socket.close()
    },

    initSvgps() {
        this.firstSvgPage = new SvgPs({
            pencilColor: this.role === 'student' ? '#2eafa7' : 'red',
            drawBeginCallback: (type, data) => {
                this.socket.emit('drawBeign', {type: type, data: data})
            },
            drawCallback: (type, data) => {
                this.socket.emit('draw', {type: type, data: data})
            }
        })
    },

    getUrlQuerys(name) {
        let url = window.location.href

        let urlParams = /^.*\?(.*)$/.exec(url)

        if(!urlParams) {
            return
        }

        let reg = new RegExp(".*"+name+"=([^&]*)(&|$)");
        let query = reg.exec(urlParams[1])
        if(!reg) {return ''}

        return query[1]
    
    }
}

Home.init()