package com.afperdomo.bodegatech.common.exception;

import com.afperdomo.bodegatech.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones.
 * Captura y procesa todas las excepciones lanzadas en los controladores.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Verifica si la excepción proviene de SpringDoc y debe ser ignorada.
     */
    private boolean isSpringDocException(Throwable ex) {
        if (ex == null) return false;

        // Verificar excepción actual
        String className = ex.getClass().getName();
        if (className.startsWith("org.springdoc")
                || className.contains("springdoc")
                || className.startsWith("io.swagger")) {
            return true;
        }

        // Verificar cadena de causas para excepciones de SpringDoc
        Throwable cause = ex.getCause();
        while (cause != null && cause != ex) {
            String causeClassName = cause.getClass().getName();
            if (causeClassName.startsWith("org.springdoc")
                    || causeClassName.contains("springdoc")
                    || causeClassName.startsWith("io.swagger")) {
                return true;
            }
            cause = cause.getCause();
        }

        return false;
    }

    /**
     * Verifica si el request es para un endpoint de SpringDoc.
     */
    private boolean isSpringDocEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.contains("/docs")
                || path.contains("/swagger-ui")
                || path.contains("/swagger-resources")
                || path.contains("/webjars");
    }

    /**
     * Maneja excepciones de recurso no encontrado (404).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(
            ResourceNotFoundException ex,
            WebRequest request) {
        log.warn("Recurso no encontrado: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message(ex.getMessage())
                .build();

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Maneja excepciones de negocio (422).
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleBusinessException(
            BusinessException ex,
            WebRequest request) {
        log.warn("Error de negocio [{}]: {}", ex.getCode(), ex.getMessage());

        Map<String, String> details = new HashMap<>();
        details.put("code", ex.getCode());

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message(ex.getMessage())
                .data(details)
                .build();

        return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    /**
     * Maneja errores de validación de argumentos (400).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            WebRequest request) {
        log.warn("Error de validación en los argumentos del método");

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Error de validación en los datos enviados")
                .data(errors)
                .build();

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja excepciones genéricas no controladas (500).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(
            Exception ex,
            HttpServletRequest request) throws Exception {

        log.info("Excepción no controlada capturada: {}", ex.getMessage(), ex);

        // Excepciones de SpringDoc o endpoints de documentación deben propagarse
        // para que Swagger funcione correctamente
        if (isSpringDocException(ex) || isSpringDocEndpoint(request)) {
            throw ex;
        }

        log.error("Error interno del servidor en {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .message("Error interno del servidor. Por favor, intente más tarde.")
                .build();

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
