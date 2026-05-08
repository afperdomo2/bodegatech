package com.afperdomo.bodegatech.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor que valida el header X-Internal-Api-Key en endpoints internos.
 * Usado para proteger callbacks de servicios internos (ej: Lambda) sin JWT.
 * Registrado únicamente en rutas internas — no interfiere con endpoints públicos ni JWT futuros.
 */
@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    private static final String API_KEY_HEADER = "X-Internal-Api-Key";

    @Value("${app.api-key}")
    private String apiKey;

    /**
     * Valida que el request contenga el header X-Internal-Api-Key con el valor correcto.
     * Retorna 403 si el header está ausente o no coincide.
     *
     * @param request  HTTP request entrante
     * @param response HTTP response
     * @param handler  handler destino
     * @return true si la API Key es válida, false si no (responde 403 directamente)
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String incomingKey = request.getHeader(API_KEY_HEADER);

        if (incomingKey == null || !incomingKey.equals(apiKey)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "API Key inválida o ausente");
            return false;
        }

        return true;
    }
}
