class App {
    constructor(settings, adapter) {
        this.settings = settings
        this.adapter = adapter
    }

    async init() {
        const app = await this.adapter.init()
        const server = http.createServer(app)
    
        // URLS configurations
        if (settings.ROOT_URLCONF) {
            const routes = require(settings.ROOT_URLCONF)
            const rootRouter = routerPath('', routes).getRouter()
            app.use(rootRouter)
        }
    
        // middlewares configuration for all routes
        for (const middleware of settings.MIDDLEWARE) {
            app.use(middleware)
        }
    
        // WEBSOCKETS configuration
        let websocketServer = null
        const isWebSocketsEnabled = typeof settings.WEBSOCKETS === 'object' && 
            ![null, undefined].includes(settings.WEBSOCKETS)
        if (isWebSocketsEnabled) {
            if (settings.WEBSOCKETS.ROOT_URLCONF) {
                const websocketRoutes = require(settings.WEBSOCKETS.ROOT_URLCONF)
                websocketServer = websockets.initialize(server, websocketRoutes)
            } else {
                throw new Error('You should define `ROOT_URLCONF` attribute in WEBSOCKETS setting in your `settings.js`')
            }
        }
        
        await database.initialize(settings)
        
        server.listen(settings.PORT, () => {
            logger.INFO.STARTING_APPLICATION(settings.APP_NAME, settings.PORT)
        })
        
        process.on('SIGINT', async () => {
            logger.INFO.STOPPING_APPLICATION(settings.APP_NAME)
            await database.close()
            if (websocketServer) {
                await websocketServer.close()
            }
            process.exit(0)
        })
    
        return app 
    }
}