package webserver

import (
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"net/http"
)

type WebServer struct {
	Router        chi.Router
	Handlers      map[string]http.HandlerFunc
	WebServerPort string
}

func NewWebServer(webServerPort string) *WebServer {
	return &WebServer{
		Router:        chi.NewRouter(),
		Handlers:      make(map[string]http.HandlerFunc),
		WebServerPort: webServerPort,
	}
}

func (ws *WebServer) AddHandler(path string, handler http.HandlerFunc) {
	ws.Handlers[path] = handler
}

func (ws *WebServer) Start() error {
	ws.Router.Use(middleware.Logger)
	for path, handler := range ws.Handlers {
		ws.Router.Post(path, handler)
	}
	return http.ListenAndServe(ws.WebServerPort, ws.Router)
}
